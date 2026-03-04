import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/db";
import { getOrCreateCurrentUserId } from "@/app/lib/currentUser";
import { ensureNodeOwnership, toNodeAttachedFile } from "@/app/lib/files";

const LinkSchema = z.object({
  nodeId: z.string().min(1),
  fileId: z.string().min(1),
});

export async function POST(req: Request) {
  const userId = await getOrCreateCurrentUserId();
  const body = await req.json().catch(() => null);
  const parsed = LinkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { nodeId, fileId } = parsed.data;

  try {
    await ensureNodeOwnership(nodeId, userId);
  } catch {
    return NextResponse.json({ error: "Node not found." }, { status: 404 });
  }

  const file = await prisma.uploadedFile.findFirst({
    where: { id: fileId, userId },
    select: { id: true, originalName: true, extension: true, mimeType: true, sizeBytes: true, createdAt: true },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  await prisma.nodeFileLink.upsert({
    where: {
      nodeId_fileId: {
        nodeId,
        fileId,
      },
    },
    update: {},
    create: {
      nodeId,
      fileId,
    },
  });

  return NextResponse.json({
    ok: true,
    item: toNodeAttachedFile(file, null),
  });
}
