import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/app/lib/db';
import { getOrCreateCurrentUserId } from '@/app/lib/currentUser';
import { streamSocialText } from '@/app/lib/llm';
import { buildSuggestionPrompt } from '@/app/lib/prompts';
import { checkUsageLimit } from '@/app/lib/usage';

const SuggestSchema = z.object({
  mapId: z.string().min(1),
  sourceNodeId: z.string().min(1),
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
  
  // Check usage limit
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
  const parsed = SuggestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { mapId, sourceNodeId } = parsed.data;

  const sourceNode = await prisma.node.findFirst({
    where: { id: sourceNodeId, mapId, map: { userId } },
    select: { id: true, type: true, data: true },
  });

  if (!sourceNode) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const type = (sourceNode.type ?? '').toLowerCase();
  if (type === 'social' || type === 'suggestion') {
    return NextResponse.json({ error: 'Suggestions require an idea, pain point, proof point, or notepad source node.' }, { status: 400 });
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
  });

  const streamData = streamSocialText({
    systemPrompt: prompt.system,
    userPrompt: prompt.user,
    temperature: 0.2,
  });

  const encoder = new TextEncoder();
  const responseStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: unknown) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      send({ type: 'start' });

      try {
        const iterator = streamData.stream[Symbol.asyncIterator]();
        let outputText = '';
        let model = '';
        
        while (true) {
          const next = await iterator.next();
          if (next.done) {
            outputText = next.value.outputText;
            model = next.value.model;
            send({
              type: 'done',
              output: outputText,
              model: model,
              provider: streamData.provider,
            });
            break;
          }

          outputText += next.value;
          send({ type: 'delta', delta: next.value });
        }
        
        // Record usage for the suggestion generation
        const savedGeneration = await prisma.generatedContent.create({
          data: {
            nodeId: sourceNodeId,
            platform: 'LINKEDIN', // Using LINKEDIN as default for suggestions
            model,
            prompt: `${prompt.system}\n\n${prompt.user}`,
            output: outputText,
            temperature: 0.2,
            seed: null,
            revision: 1,
          },
          select: { id: true },
        });
        
        try {
          await prisma.usageRecord.create({
            data: {
              userId,
              generationId: savedGeneration.id,
            },
          });
        } catch (usageError) {
          console.error('Failed to record usage:', usageError);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Suggestion generation failed.';
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
