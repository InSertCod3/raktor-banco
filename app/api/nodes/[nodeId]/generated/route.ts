import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PlatformType } from '@prisma/client';
import { prisma } from '@/app/lib/db';
import { getOrCreateCurrentUserId } from '@/app/lib/currentUser';

const QuerySchema = z.object({
  platform: z.enum(['LINKEDIN', 'FACEBOOK', 'INSTAGRAM']),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  const userId = await getOrCreateCurrentUserId();
  const { nodeId } = await params;

  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query.' }, { status: 400 });
  }

  const platform = parsed.data.platform as PlatformType;

  // Enforce ownership: node -> map -> user
  const node = await prisma.node.findFirst({
    where: { id: nodeId, map: { userId } },
    select: { id: true },
  });
  if (!node) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const items = await prisma.generatedContent.findMany({
    where: { nodeId, platform },
    orderBy: { revision: 'desc' },
    take: 20,
    select: { id: true, createdAt: true, output: true, revision: true, model: true },
  });

  return NextResponse.json({ items });
}



