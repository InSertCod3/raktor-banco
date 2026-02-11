import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PlatformType, Prisma } from '@prisma/client';
import { prisma } from '@/app/lib/db';
import { getOrCreateCurrentUserId } from '@/app/lib/currentUser';
import { streamSocialText } from '@/app/lib/llm';
import { buildPlatformPrompt } from '@/app/lib/prompts';

const GenerateSchema = z.object({
  mapId: z.string().min(1),
  nodeId: z.string().min(1),
  socialNodeId: z.string().min(1).optional(),
  platform: z.enum(['LINKEDIN', 'FACEBOOK', 'INSTAGRAM']),
});

function collectTextValues(input: unknown): string[] {
  if (typeof input === 'string') {
    const trimmed = input.trim();
    return trimmed ? [trimmed] : [];
  }

  if (Array.isArray(input)) {
    return input.flatMap((value) => collectTextValues(value));
  }

  if (input && typeof input === 'object') {
    return Object.values(input).flatMap((value) => collectTextValues(value));
  }

  return [];
}

export async function POST(req: Request) {
  const userId = await getOrCreateCurrentUserId();
  const body = await req.json().catch(() => null);
  const parsed = GenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { mapId, nodeId, socialNodeId: requestedSocialNodeId } = parsed.data;
  const platform = parsed.data.platform as PlatformType | 'INSTAGRAM';

  const requestedNode = await prisma.node.findFirst({
    where: { id: nodeId, mapId, map: { userId } },
    select: { id: true, type: true, positionX: true, positionY: true, data: true },
  });

  if (!requestedNode) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let ideaNode = requestedNode;
  let targetSocialNodeId = requestedSocialNodeId;
  const requestedIsSocial = (requestedNode.type ?? '').toLowerCase() === 'social';

  if (requestedIsSocial) {
    targetSocialNodeId = requestedSocialNodeId ?? requestedNode.id;
    const linkEdge = await prisma.edge.findFirst({
      where: {
        mapId,
        OR: [{ source: requestedNode.id }, { target: requestedNode.id }],
      },
      select: { source: true, target: true },
    });

    if (!linkEdge) {
      return NextResponse.json({ error: 'Social node is not connected to an idea node.' }, { status: 400 });
    }

    const connectedIdeaId = linkEdge.source === requestedNode.id ? linkEdge.target : linkEdge.source;
    const connectedIdea = await prisma.node.findFirst({
      where: {
        id: connectedIdeaId,
        mapId,
        map: { userId },
      },
      select: { id: true, type: true, positionX: true, positionY: true, data: true },
    });

    if (!connectedIdea || (connectedIdea.type ?? '').toLowerCase() === 'social') {
      return NextResponse.json({ error: 'Social node must connect to an idea node.' }, { status: 400 });
    }

    ideaNode = connectedIdea;
  }

  const connectedEdges = await prisma.edge.findMany({
    where: {
      mapId,
      OR: [{ source: ideaNode.id }, { target: ideaNode.id }],
    },
    select: { id: true, source: true, target: true, type: true, data: true },
  });

  const connectedNodeIds = new Set<string>([ideaNode.id]);
  for (const edge of connectedEdges) {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  }

  const connectedNodes = await prisma.node.findMany({
    where: { mapId, id: { in: Array.from(connectedNodeIds) } },
    select: { id: true, type: true, positionX: true, positionY: true, data: true },
  });

  const nodeById = new Map(connectedNodes.map((connected) => [connected.id, connected]));

  if (targetSocialNodeId) {
    const targetNode = nodeById.get(targetSocialNodeId);
    if (!targetNode || (targetNode.type ?? '').toLowerCase() !== 'social') {
      return NextResponse.json({ error: 'Requested social node is invalid for this idea.' }, { status: 400 });
    }
  }

  const ideaText = String((ideaNode.data as { text?: unknown } | null)?.text ?? '').trim();
  if (!ideaText) {
    return NextResponse.json(
      { error: 'Node has no idea text to generate from.' },
      { status: 400 }
    );
  }

  const temperature = 0.2;
  const contextTexts = connectedNodes
    .filter((connected) => connected.id !== ideaNode.id && (connected.type ?? '').toLowerCase() !== 'social')
    .flatMap((connected) => collectTextValues(connected.data))
    .filter(Boolean);

  const prompt = buildPlatformPrompt({ platform, ideaText, contextTexts });

  const last = await prisma.generatedContent.findFirst({
    where: { nodeId: ideaNode.id, platform: platform as PlatformType },
    orderBy: { revision: 'desc' },
    select: { revision: true },
  });

  let socialNode = (targetSocialNodeId ? nodeById.get(targetSocialNodeId) : null) ?? connectedEdges
    .map((edge) => nodeById.get(edge.source === ideaNode.id ? edge.target : edge.source))
    .find((candidate) => (candidate?.type ?? '').toLowerCase() === 'social');

  if (socialNode && (socialNode.type ?? '').toLowerCase() !== 'social') {
    socialNode = undefined;
  }

  const existingSocialEdge = socialNode
    ? connectedEdges.find(
        (edge) =>
          (edge.source === ideaNode.id && edge.target === socialNode!.id) ||
          (edge.target === ideaNode.id && edge.source === socialNode!.id)
      )
    : null;

  const socialNodeId = socialNode?.id ?? targetSocialNodeId ?? crypto.randomUUID();
  const socialEdgeId = existingSocialEdge?.id ?? crypto.randomUUID();
  const socialLabel =
    platform === 'LINKEDIN' ? 'LinkedIn' : platform === 'FACEBOOK' ? 'Facebook' : 'Instagram';
  const [savedSocialNode, savedSocialEdge] = await prisma.$transaction([
    prisma.node.upsert({
      where: { id: socialNodeId },
      update: {
        mapId,
        type: 'social',
        data: { label: socialLabel, type: 'social', platform, content: '' },
      },
      create: {
        id: socialNodeId,
        mapId,
        type: 'social',
        positionX: ideaNode.positionX + 280,
        positionY: ideaNode.positionY + 60,
        data: { label: socialLabel, type: 'social', platform, content: '' },
      },
      select: { id: true, type: true, positionX: true, positionY: true, data: true },
    }),
    prisma.edge.upsert({
      where: { id: socialEdgeId },
      update: {
        mapId,
        source: ideaNode.id,
        target: socialNodeId,
        type: existingSocialEdge?.type ?? 'deletable',
        data: existingSocialEdge?.data ?? Prisma.JsonNull,
      },
      create: {
        id: socialEdgeId,
        mapId,
        source: ideaNode.id,
        target: socialNodeId,
        type: 'deletable',
        data: Prisma.JsonNull,
      },
      select: { id: true, source: true, target: true, type: true, data: true },
    }),
  ]);

  const streamData = streamSocialText({
    systemPrompt: prompt.system,
    userPrompt: prompt.user,
    temperature,
  });

  const encoder = new TextEncoder();
  const responseStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: unknown) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      send({
        type: 'start',
        socialNode: {
          id: savedSocialNode.id,
          type: savedSocialNode.type ?? undefined,
          position: { x: savedSocialNode.positionX, y: savedSocialNode.positionY },
          data: savedSocialNode.data,
        },
        socialEdge: {
          id: savedSocialEdge.id,
          source: savedSocialEdge.source,
          target: savedSocialEdge.target,
          type: savedSocialEdge.type ?? undefined,
          data: savedSocialEdge.data ?? undefined,
        },
      });

      let outputText = '';
      let model = '';

      try {
        const iterator = streamData.stream[Symbol.asyncIterator]();
        while (true) {
          const next = await iterator.next();
          if (next.done) {
            outputText = next.value.outputText;
            model = next.value.model;
            break;
          }

          outputText += next.value;
          send({ type: 'delta', delta: next.value, socialNodeId: socialNodeId });
        }

        const [savedGeneration, updatedSocialNode] = await prisma.$transaction([
          prisma.generatedContent.create({
            data: {
              nodeId: ideaNode.id,
              platform: platform as PlatformType,
              model,
              prompt: `${prompt.system}\n\n${prompt.user}`,
              output: outputText,
              temperature,
              seed: null,
              revision: (last?.revision ?? 0) + 1,
            },
            select: { id: true, createdAt: true, output: true, revision: true, model: true },
          }),
          prisma.node.update({
            where: { id: socialNodeId },
            data: {
              data: { label: socialLabel, type: 'social', platform, content: outputText },
            },
            select: { id: true, type: true, positionX: true, positionY: true, data: true },
          }),
        ]);

        send({
          type: 'done',
          provider: streamData.provider,
          generation: savedGeneration,
          socialNode: {
            id: updatedSocialNode.id,
            type: updatedSocialNode.type ?? undefined,
            position: { x: updatedSocialNode.positionX, y: updatedSocialNode.positionY },
            data: updatedSocialNode.data,
          },
          socialEdge: {
            id: savedSocialEdge.id,
            source: savedSocialEdge.source,
            target: savedSocialEdge.target,
            type: savedSocialEdge.type ?? undefined,
            data: savedSocialEdge.data ?? undefined,
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Generation failed.';
        send({ type: 'error', error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(responseStream, {
    headers: {
      'content-type': 'application/x-ndjson; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
    },
  });
}
