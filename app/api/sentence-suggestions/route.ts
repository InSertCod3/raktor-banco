import { NextResponse } from 'next/server';
import { PlatformType } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/app/lib/db';
import { getOrCreateCurrentUserId } from '@/app/lib/currentUser';
import { generateSocialText } from '@/app/lib/llm';
import { buildSentenceReplacementPrompt } from '@/app/lib/prompts';
import { checkUsageLimit, recordUsage } from '@/app/lib/usage';

const SentenceSuggestionsSchema = z.object({
  mapId: z.string().min(1),
  nodeId: z.string().min(1),
  platform: z.enum(['LINKEDIN', 'FACEBOOK', 'INSTAGRAM']),
  generationMode: z.enum(['SOCIAL_POST', 'LINKEDIN_DM_LEAD']).optional(),
  sentence: z.string().min(1).max(500),
  fullPostText: z.string().min(1).max(6000),
});

function parseSuggestions(output: string): string[] {
  const trimmed = output.trim();
  if (!trimmed) return [];

  const withoutCodeFences = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .replace(/```(?:json)?/gi, '')
    .trim();

  const tryParseJson = (raw: string): string[] => {
    const parsed = JSON.parse(raw) as { suggestions?: unknown } | unknown[];
    const rawSuggestions = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { suggestions?: unknown }).suggestions)
      ? ((parsed as { suggestions?: unknown[] }).suggestions ?? [])
      : [];

    return rawSuggestions
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .slice(0, 3);
  };

  try {
    return tryParseJson(withoutCodeFences);
  } catch {
    const objectMatch = withoutCodeFences.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        const fromObject = tryParseJson(objectMatch[0]);
        if (fromObject.length > 0) return fromObject;
      } catch {
        // Fall through to text parsing.
      }
    }

    const quotedCandidates = Array.from(withoutCodeFences.matchAll(/"([^"\n]+)"/g))
      .map((match) => match[1]?.trim() ?? '')
      .filter((value) => value && value.toLowerCase() !== 'suggestions');
    if (quotedCandidates.length > 0) {
      return Array.from(new Set(quotedCandidates)).slice(0, 3);
    }

    const lines = withoutCodeFences
      .split('\n')
      .map((line) => line.replace(/^\s*[-*\d.)]+\s*/, '').trim())
      .map((line) => line.replace(/^["']|["'],?$/g, '').trim())
      .filter(
        (line) =>
          Boolean(line) &&
          line !== '{' &&
          line !== '}' &&
          line !== '[' &&
          line !== ']' &&
          !line.toLowerCase().startsWith('suggestions')
      );
    return Array.from(new Set(lines)).slice(0, 3);
  }
}

export async function POST(req: Request) {
  const userId = await getOrCreateCurrentUserId();

  const usageCheck = await checkUsageLimit(userId);
  if (!usageCheck.allowed) {
    return NextResponse.json(
      {
        error: 'Usage limit exceeded',
        limit: usageCheck.limit,
        currentUsage: usageCheck.usage,
        tier: usageCheck.tier,
        upgradeUrl: '/pricing',
      },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = SentenceSuggestionsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { mapId, nodeId, platform, generationMode, sentence, fullPostText } = parsed.data;

  const node = await prisma.node.findFirst({
    where: { id: nodeId, mapId, map: { userId } },
    select: { id: true },
  });

  if (!node) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const prompt = buildSentenceReplacementPrompt({
    platform: platform as PlatformType | 'INSTAGRAM',
    generationMode,
    sentence,
    fullPostText,
  });

  const generated = await generateSocialText({
    systemPrompt: prompt.system,
    userPrompt: prompt.user,
    temperature: 0.25,
  });

  const suggestions = parseSuggestions(generated.outputText);
  if (suggestions.length === 0) {
    return NextResponse.json({ error: 'No suggestions generated.' }, { status: 502 });
  }

  const savedGeneration = await prisma.generatedContent.create({
    data: {
      nodeId: node.id,
      platform: platform as PlatformType,
      model: generated.model,
      prompt: `${prompt.system}\n\n${prompt.user}`,
      output: generated.outputText,
      temperature: 0.25,
      seed: null,
      revision: 1,
    },
    select: { id: true },
  });

  try {
    await recordUsage(userId, savedGeneration.id);
  } catch (usageError) {
    console.error('Failed to record usage:', usageError);
  }

  return NextResponse.json({ suggestions });
}
