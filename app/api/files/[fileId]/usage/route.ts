import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getOrCreateCurrentUserId } from "@/app/lib/currentUser";

type UsageRow = {
  mapId: string;
  mapTitle: string;
  nodeCount: number;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const userId = await getOrCreateCurrentUserId();
  const { fileId } = await params;

  const file = await prisma.uploadedFile.findFirst({
    where: { id: fileId, userId },
    select: { id: true },
  });

  if (!file) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const rows = await prisma.$queryRaw<UsageRow[]>`
    SELECT
      m.id AS "mapId",
      m.title AS "mapTitle",
      COUNT(DISTINCT n.id)::int AS "nodeCount"
    FROM "Map" m
    JOIN "Node" n ON n."mapId" = m.id
    WHERE m."userId" = ${userId}
      AND (
        EXISTS (
          SELECT 1
          FROM jsonb_array_elements(COALESCE(n.data->'attachedFiles', '[]'::jsonb)) AS af
          WHERE af->>'id' = ${fileId}
        )
        OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements(COALESCE(n.data->'attachments', '[]'::jsonb)) AS af
          WHERE af->>'id' = ${fileId}
        )
        OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements(COALESCE(n.data->'files', '[]'::jsonb)) AS af
          WHERE af->>'id' = ${fileId}
        )
      )
    GROUP BY m.id, m.title
    ORDER BY m."updatedAt" DESC
  `;

  return NextResponse.json({
    fileId,
    activeUsageCount: rows.length,
    maps: rows.map((row) => ({
      id: row.mapId,
      title: row.mapTitle,
      nodeCount: row.nodeCount,
    })),
  });
}
