import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PlatformType, Prisma } from '@prisma/client';
import { prisma } from '@/app/lib/db';
import { getOrCreateCurrentUserId } from '@/app/lib/currentUser';
import { streamSocialText } from '@/app/lib/llm';
import { buildPlatformPrompt } from '@/app/lib/prompts';
import { generateId } from '@/app/lib/utils';

const GenerateSchema = z.object({
  mapId: z.string().min(1),
  nodeId: z.string().min(1),
  socialNodeId: z.string().min(1).optional(),
  platform: z.enum(['LINKEDIN', 'FACEBOOK', 'INSTAGRAM']),
});

type MessagingLength = 'shortest' | 'shorter' | 'standard' | 'longer' | 'longest';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getMessagingLengthFromSocialData(data: unknown, platform: PlatformType | 'INSTAGRAM'): MessagingLength {
  if (!isRecord(data)) return 'standard';
  const byPlatform = data.messagingLengthByPlatform;
  if (!isRecord(byPlatform)) return 'standard';
  const raw = byPlatform[platform];
  if (raw === 'medium') return 'standard';
  if (raw === 'long') return 'longer';
  if (raw === 'shortest' || raw === 'shorter' || raw === 'standard' || raw === 'longer' || raw === 'longest') {
    return raw;
  }
  return 'standard';
}

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
  const mapEdges = await prisma.edge.findMany({
    where: { mapId },
    select: { id: true, source: true, target: true, type: true, data: true },
  });

  const collectConnectedIds = (startId: string): Set<string> => {
    const visited = new Set<string>([startId]);
    const queue: string[] = [startId];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;

      for (const edge of mapEdges) {
        if (edge.source !== current && edge.target !== current) continue;
        const neighbor = edge.source === current ? edge.target : edge.source;
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }

    return visited;
  };

  if (requestedIsSocial) {
    targetSocialNodeId = requestedSocialNodeId ?? requestedNode.id;
    const connectedIds = collectConnectedIds(requestedNode.id);
    if (connectedIds.size <= 1) {
      return NextResponse.json({ error: 'Social node is not connected to an idea node.' }, { status: 400 });
    }

    const connectedNodes = await prisma.node.findMany({
      where: {
        id: { in: Array.from(connectedIds) },
        mapId,
        map: { userId },
      },
      select: { id: true, type: true, positionX: true, positionY: true, data: true },
    });

    const connectedIdea = connectedNodes.find((node) => (node.type ?? '').toLowerCase() === 'idea');

    if (!connectedIdea) {
      return NextResponse.json({ error: 'Social node must connect to an idea node.' }, { status: 400 });
    }

    ideaNode = connectedIdea;
  }

  const connectedNodeIds = collectConnectedIds(ideaNode.id);
  const connectedEdges = mapEdges.filter(
    (edge) => connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target)
  );
  const ideaEdges = connectedEdges.filter(
    (edge) => edge.source === ideaNode.id || edge.target === ideaNode.id
  );

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
  const nonSocialConnectedNodes = connectedNodes.filter(
    (connected) => (connected.type ?? '').toLowerCase() !== 'social'
  );
  const painPointTexts = nonSocialConnectedNodes
    .filter((connected) => (connected.type ?? '').toLowerCase() === 'painpoint')
    .flatMap((connected) => collectTextValues(connected.data))
    .filter(Boolean);
  const proofPointTexts = nonSocialConnectedNodes
    .filter((connected) => (connected.type ?? '').toLowerCase() === 'proofpoint')
    .flatMap((connected) => collectTextValues(connected.data))
    .filter(Boolean);
  const toneValues = Array.from(
    new Set(
      nonSocialConnectedNodes
        .filter((connected) => (connected.type ?? '').toLowerCase() === 'tone')
        .map((connected) => {
          const value = (connected.data as { tone?: unknown } | null)?.tone;
          return typeof value === 'string' ? value.trim() : '';
        })
        .filter(Boolean)
    )
  );
  const contextTexts = nonSocialConnectedNodes
    .filter((connected) => {
      const type = (connected.type ?? '').toLowerCase();
      return connected.id !== ideaNode.id && type !== 'suggestion' && type !== 'painpoint' && type !== 'proofpoint' && type !== 'tone';
    })
    .flatMap((connected) => collectTextValues(connected.data))
    .filter(Boolean);

  const prompt = buildPlatformPrompt({
    platform,
    ideaText,
    contextTexts,
    painPointTexts,
    proofPointTexts,
    toneValues,
    messagingLength: getMessagingLengthFromSocialData(requestedNode.data, platform),
  });

  const last = await prisma.generatedContent.findFirst({
    where: { nodeId: ideaNode.id, platform: platform as PlatformType },
    orderBy: { revision: 'desc' },
    select: { revision: true },
  });

  let socialNode = (targetSocialNodeId ? nodeById.get(targetSocialNodeId) : null) ?? ideaEdges
    .map((edge) => nodeById.get(edge.source === ideaNode.id ? edge.target : edge.source))
    .find((candidate) => (candidate?.type ?? '').toLowerCase() === 'social');

  if (socialNode && (socialNode.type ?? '').toLowerCase() !== 'social') {
    socialNode = undefined;
  }

  const existingSocialEdge = socialNode
    ? ideaEdges.find(
        (edge) =>
          (edge.source === ideaNode.id && edge.target === socialNode!.id) ||
          (edge.target === ideaNode.id && edge.source === socialNode!.id)
      )
    : null;

  const socialNodeId = socialNode?.id ?? targetSocialNodeId ?? generateId(24);
  const socialEdgeId = existingSocialEdge?.id ?? generateId(24);
  const socialLabel =
    platform === 'LINKEDIN' ? 'LinkedIn' : platform === 'FACEBOOK' ? 'Facebook' : 'Instagram';
  const socialDataBase = isRecord(socialNode?.data)
    ? socialNode.data
    : isRecord(requestedNode.data)
    ? requestedNode.data
    : {};
  const socialDataWithDefaults = {
    ...socialDataBase,
    label: socialLabel,
    type: 'social',
    platform,
  };
  const savedSocialNode = await prisma.node.upsert({
    where: { id: socialNodeId },
    update: {
      mapId,
      type: 'social',
      data: { ...socialDataWithDefaults, content: '' },
    },
    create: {
      id: socialNodeId,
      mapId,
      type: 'social',
      positionX: ideaNode.positionX + 280,
      positionY: ideaNode.positionY + 60,
      data: { ...socialDataWithDefaults, content: '' },
    },
    select: { id: true, type: true, positionX: true, positionY: true, data: true },
  });

  // When generating from an existing social node, do not force-create a direct edge to idea.
  let savedSocialEdge = existingSocialEdge ?? null;
  if (!requestedIsSocial) {
    savedSocialEdge = await prisma.edge.upsert({
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
    });
  }

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
        socialEdge: savedSocialEdge
          ? {
              id: savedSocialEdge.id,
              source: savedSocialEdge.source,
              target: savedSocialEdge.target,
              type: savedSocialEdge.type ?? undefined,
              data: savedSocialEdge.data ?? undefined,
            }
          : undefined,
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
              data: { ...socialDataWithDefaults, content: outputText },
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
          socialEdge: savedSocialEdge
            ? {
                id: savedSocialEdge.id,
                source: savedSocialEdge.source,
                target: savedSocialEdge.target,
                type: savedSocialEdge.type ?? undefined,
                data: savedSocialEdge.data ?? undefined,
              }
            : undefined,
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
