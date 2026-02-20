import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { getOrCreateCurrentUserId } from '@/app/lib/currentUser';
import { generateId } from '@/app/lib/utils';
import { z } from 'zod';
import { checkMapLimit } from '@/app/lib/usage';

const CreateMapSchema = z.object({
  title: z.string().trim().min(1).max(120),
});

export async function GET() {
  const userId = await getOrCreateCurrentUserId();
  const maps = await prisma.map.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, updatedAt: true, createdAt: true },
  });
  return NextResponse.json({ maps });
}

export async function POST(req: Request) {
  const userId = await getOrCreateCurrentUserId();
  
  // Check map limit before creating
  const mapLimitCheck = await checkMapLimit(userId);
  if (!mapLimitCheck.allowed) {
    return NextResponse.json(
      {
        error: 'Map limit exceeded',
        limit: mapLimitCheck.limit,
        currentMaps: mapLimitCheck.currentMaps,
        tier: mapLimitCheck.tier,
        upgradeUrl: '/pricing',
        isUnlimited: mapLimitCheck.isUnlimited,
      },
      { status: 429 }
    );
  }
  
  const body = await req.json().catch(() => ({}));
  const input = CreateMapSchema.safeParse(body);
  if (!input.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const map = await prisma.map.create({
    data: {
      userId,
      title: input.data.title,
      nodes: {
        create: {
          id: generateId(24),
          type: 'idea',
          positionX: 0,
          positionY: 0,
          data: { text: '' },
        },
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ mapId: map.id }, { status: 201 });
}



