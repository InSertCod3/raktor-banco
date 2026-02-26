import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PlatformType } from '@prisma/client';
import { prisma } from '@/app/lib/db';
import { getOrCreateCurrentUserId } from '@/app/lib/currentUser';
import { streamSocialText } from '@/app/lib/llm';
import { checkUsageLimit } from '@/app/lib/usage';

const ChatRefineSchema = z.object({
  mapId: z.string().min(1),
  nodeId: z.string().min(1),
  platform: z.enum(['LINKEDIN', 'FACEBOOK', 'INSTAGRAM']),
  userMessage: z.string().min(1),
  currentContent: z.string().min(1),
  generationMode: z.enum(['SOCIAL_POST', 'LINKEDIN_DM_LEAD']).optional(),
});

function buildChatRefinePrompt(args: {
  platform: PlatformType | 'INSTAGRAM';
  generationMode?: 'SOCIAL_POST' | 'LINKEDIN_DM_LEAD';
  currentContent: string;
  userMessage: string;
}): { system: string; user: string } {
  const platformLabel =
    args.platform === PlatformType.LINKEDIN
      ? 'LinkedIn'
      : args.platform === PlatformType.FACEBOOK
      ? 'Facebook'
      : 'Instagram';

  const isDm = args.generationMode === 'LINKEDIN_DM_LEAD';

  const system = [
    isDm
      ? 'You are an assistant that refines LinkedIn lead-generation DMs based on user feedback.'
      : `You are an assistant that refines ${platformLabel} posts based on user feedback.`,
    'When the user asks you to modify the content, apply their feedback while:',
    '- Keeping the same core message and meaning',
    '- Maintaining the platform-appropriate tone',
    '- Keeping similar length unless specifically asked to change it',
    '- Preserving hashtags and emojis unless instructed otherwise',
    'Return only the modified post content, no explanations or markdown.',
  ].join('\n');

  const user = [
    'Current post/dm:',
    `"${args.currentContent.trim()}"`,
    '',
    'User request:',
    args.userMessage.trim(),
    '',
    'Apply the user request and return the modified content:',
  ].join('\n');

  return { system, user };
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
  const parsed = ChatRefineSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { mapId, nodeId, platform, userMessage, currentContent, generationMode } = parsed.data;

  // Verify node belongs to user and map
  const node = await prisma.node.findFirst({
    where: { id: nodeId, mapId, map: { userId } },
    select: { id: true, data: true },
  });

  if (!node) {
    return NextResponse.json({ error: 'Node not found' }, { status: 404 });
  }

  const prompt = buildChatRefinePrompt({
    platform,
    generationMode,
    currentContent,
    userMessage,
  });

  const temperature = 0.3;

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

      send({ type: 'start' });

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
          send({ type: 'delta', delta: next.value });
        }

        // Record usage for the generation
        try {
          const usageRecord = await prisma.usageRecord.create({
            data: {
              userId,
              generationId: '', // Will be linked if we create a generatedContent record
            },
          });
        } catch (usageError) {
          console.error('Failed to record usage:', usageError);
        }

        send({
          type: 'done',
          provider: streamData.provider,
          refinedContent: outputText,
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
      'connection': 'keep-alive',
    },
  });
}
