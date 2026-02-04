import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { getOrCreateCurrentUserId } from '@/app/lib/currentUser';
import { z } from 'zod';

const NodeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1).optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.unknown(),
});

const EdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  type: z.string().min(1).optional(),
  data: z.unknown().optional(),
});

const GraphSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ mapId: string }> }
) {
  const userId = await getOrCreateCurrentUserId();
  const { mapId } = await params;

  const map = await prisma.map.findFirst({
    where: { id: mapId, userId },
    select: { id: true },
  });
  if (!map) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = GraphSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { nodes, edges } = parsed.data;

  const [existingNodeIds, existingEdgeIds] = await Promise.all([
    prisma.node.findMany({ where: { mapId }, select: { id: true } }),
    prisma.edge.findMany({ where: { mapId }, select: { id: true } }),
  ]);

  const incomingNodeIds = new Set(nodes.map((n) => n.id));
  const incomingEdgeIds = new Set(edges.map((e) => e.id));

  const nodeDeletes = existingNodeIds
    .map((n) => n.id)
    .filter((id) => !incomingNodeIds.has(id));
  const edgeDeletes = existingEdgeIds
    .map((e) => e.id)
    .filter((id) => !incomingEdgeIds.has(id));

  await prisma.$transaction([
    prisma.edge.deleteMany({ where: { mapId, id: { in: edgeDeletes } } }),
    prisma.node.deleteMany({ where: { mapId, id: { in: nodeDeletes } } }),
    ...nodes.map((n) =>
      prisma.node.upsert({
        where: { id: n.id },
        update: {
          mapId,
          type: n.type ?? null,
          positionX: n.position.x,
          positionY: n.position.y,
          data: n.data as any,
        },
        create: {
          id: n.id,
          mapId,
          type: n.type ?? null,
          positionX: n.position.x,
          positionY: n.position.y,
          data: n.data as any,
        },
      })
    ),
    ...edges.map((e) =>
      prisma.edge.upsert({
        where: { id: e.id },
        update: {
          mapId,
          source: e.source,
          target: e.target,
          type: e.type ?? null,
          data: (e.data ?? null) as any,
        },
        create: {
          id: e.id,
          mapId,
          source: e.source,
          target: e.target,
          type: e.type ?? null,
          data: (e.data ?? null) as any,
        },
      })
    ),
  ]);

  return NextResponse.json({ ok: true });
}



