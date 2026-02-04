import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PlatformType } from '@prisma/client';
import { prisma } from '@/app/lib/db';
import { getOrCreateCurrentUserId } from '@/app/lib/currentUser';
import { getModelName, getOpenAIClient } from '@/app/lib/openai';
import { buildPlatformPrompt } from '@/app/lib/prompts';

const GenerateSchema = z.object({
  mapId: z.string().min(1),
  nodeId: z.string().min(1),
  platform: z.enum(['LINKEDIN', 'FACEBOOK']),
});

export async function POST(req: Request) {
  const userId = await getOrCreateCurrentUserId();
  const body = await req.json().catch(() => null);
  const parsed = GenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not set.' },
      { status: 500 }
    );
  }

  const { mapId, nodeId } = parsed.data;
  const platform = parsed.data.platform as PlatformType;

  const node = await prisma.node.findFirst({
    where: { id: nodeId, mapId, map: { userId } },
    select: { id: true, data: true },
  });

  if (!node) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const ideaText = String((node.data as any)?.text ?? '').trim();
  if (!ideaText) {
    return NextResponse.json(
      { error: 'Node has no idea text to generate from.' },
      { status: 400 }
    );
  }

  const prompt = buildPlatformPrompt({ platform, ideaText });
  const model = getModelName();
  const temperature = 0.2;

  const openai = getOpenAIClient();
  const resp = await openai.responses.create({
    model,
    temperature,
    input: [
      { role: 'system', content: prompt.system },
      { role: 'user', content: prompt.user },
    ],
  });

  const outputText =
    resp.output_text?.trim() ||
    '';

  if (!outputText) {
    return NextResponse.json(
      { error: 'Model returned an empty response.' },
      { status: 502 }
    );
  }

  const last = await prisma.generatedContent.findFirst({
    where: { nodeId, platform },
    orderBy: { revision: 'desc' },
    select: { revision: true },
  });

  const saved = await prisma.generatedContent.create({
    data: {
      nodeId,
      platform,
      model,
      prompt: `${prompt.system}\n\n${prompt.user}`,
      output: outputText,
      temperature,
      seed: null,
      revision: (last?.revision ?? 0) + 1,
    },
    select: { id: true, createdAt: true, output: true, revision: true },
  });

  return NextResponse.json({ generation: saved });
}


