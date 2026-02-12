import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PlatformType } from '@prisma/client';
import { prisma } from '@/app/lib/db';
import { getOrCreateCurrentUserId } from '@/app/lib/currentUser';
import { generateSocialText } from '@/app/lib/llm';
import { buildSuggestionPrompt } from '@/app/lib/prompts';

const SuggestSchema = z.object({
  mapId: z.string().min(1),
  sourceNodeId: z.string().min(1),
  platform: z.enum(['LINKEDIN', 'FACEBOOK', 'INSTAGRAM']).optional(),
});

function collectTextValues(input: unknown): string[] {
  if (typeof input === 'string') {
    const trimmed = input.trim();
    return trimmed ? [trimmed] : [];
  }
  if (Array.isArray(input)) return input.flatMap((value) => collectTextValues(value));
  if (input && typeof input === 'object') return Object.values(input).flatMap((value) => collectTextValues(value));
  return [];
}

export async function POST(req: Request) {
  const userId = await getOrCreateCurrentUserId();
  const body = await req.json().catch(() => null);
  const parsed = SuggestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { mapId, sourceNodeId } = parsed.data;
  const platform = (parsed.data.platform ?? 'LINKEDIN') as PlatformType | 'INSTAGRAM';

  const sourceNode = await prisma.node.findFirst({
    where: { id: sourceNodeId, mapId, map: { userId } },
    select: { id: true, type: true, data: true },
  });

  if (!sourceNode) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const type = (sourceNode.type ?? '').toLowerCase();
  if (type === 'social' || type === 'suggestion') {
    return NextResponse.json({ error: 'Suggestions require an idea or notepad source node.' }, { status: 400 });
  }

  const sourceTexts = collectTextValues(sourceNode.data);
  const sourceText = sourceTexts.join('\n').trim();
  if (!sourceText) {
    return NextResponse.json({ error: 'Source node has no text to analyze.' }, { status: 400 });
  }

  const connectedEdges = await prisma.edge.findMany({
    where: { mapId, OR: [{ source: sourceNodeId }, { target: sourceNodeId }] },
    select: { source: true, target: true },
  });
  const connectedIds = connectedEdges.map((edge) => (edge.source === sourceNodeId ? edge.target : edge.source));

  const connectedNodes = connectedIds.length
    ? await prisma.node.findMany({
        where: { mapId, id: { in: connectedIds } },
        select: { id: true, type: true, data: true },
      })
    : [];

  const contextTexts = connectedNodes
    .filter((node) => {
      const nodeType = (node.type ?? '').toLowerCase();
      return nodeType !== 'social' && nodeType !== 'suggestion';
    })
    .flatMap((node) => collectTextValues(node.data))
    .filter(Boolean);

  const prompt = buildSuggestionPrompt({
    sourceText,
    contextTexts,
    platform,
  });

  try {
    const generated = await generateSocialText({
      systemPrompt: prompt.system,
      userPrompt: prompt.user,
      temperature: 0.2,
    });
    return NextResponse.json({
      output: generated.outputText,
      model: generated.model,
      provider: generated.provider,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Suggestion generation failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
