import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getOrCreateCurrentUserId } from "@/app/lib/currentUser";
import { getGcsStorageClient } from "@/app/lib/gcs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const userId = await getOrCreateCurrentUserId();
  const { fileId } = await params;

  const file = await prisma.uploadedFile.findFirst({
    where: { id: fileId, userId },
    select: {
      id: true,
      gcsBucket: true,
      gcsObjectPath: true,
    },
  });

  if (!file) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const activeUsage = await prisma.$queryRaw<Array<{ mapId: string; mapTitle: string; nodeCount: number }>>`
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

  if (activeUsage.length > 0) {
    return NextResponse.json(
      {
        error: "This file is still attached to one or more mind maps. Detach it from all maps before deleting.",
        activeUsageCount: activeUsage.length,
        maps: activeUsage.map((row) => ({
          id: row.mapId,
          title: row.mapTitle,
          nodeCount: row.nodeCount,
        })),
      },
      { status: 409 },
    );
  }

  await prisma.uploadedFile.delete({
    where: { id: file.id },
  });

  const storage = getGcsStorageClient();
  await storage
    .bucket(file.gcsBucket)
    .file(file.gcsObjectPath)
    .delete({ ignoreNotFound: true })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
