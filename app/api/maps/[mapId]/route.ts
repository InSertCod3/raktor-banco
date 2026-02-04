import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { getOrCreateCurrentUserId } from '@/app/lib/currentUser';
import { z } from 'zod';

const UpdateMapSchema = z.object({
  title: z.string().trim().min(1).max(120),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ mapId: string }> }
) {
  const userId = await getOrCreateCurrentUserId();
  const { mapId } = await params;

  const map = await prisma.map.findFirst({
    where: { id: mapId, userId },
    select: {
      id: true,
      title: true,
      nodes: {
        select: { id: true, type: true, positionX: true, positionY: true, data: true },
      },
      edges: {
        select: { id: true, source: true, target: true, type: true, data: true },
      },
    },
  });

  if (!map) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    map: {
      id: map.id,
      title: map.title,
      nodes: map.nodes.map((n) => ({
        id: n.id,
        type: n.type ?? undefined,
        position: { x: n.positionX, y: n.positionY },
        data: n.data,
      })),
      edges: map.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type ?? undefined,
        data: e.data ?? undefined,
      })),
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ mapId: string }> }
) {
  const userId = await getOrCreateCurrentUserId();
  const { mapId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = UpdateMapSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const updated = await prisma.map.updateMany({
    where: { id: mapId, userId },
    data: { title: parsed.data.title },
  });

  if (updated.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ mapId: string }> }
) {
  const userId = await getOrCreateCurrentUserId();
  const { mapId } = await params;
  const deleted = await prisma.map.deleteMany({ where: { id: mapId, userId } });
  if (deleted.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}



