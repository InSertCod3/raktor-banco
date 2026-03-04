import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getOrCreateCurrentUserId } from "@/app/lib/currentUser";
import { getGcsStorageClient } from "@/app/lib/gcs";
import { Readable } from "stream";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const userId = await getOrCreateCurrentUserId();
  const { fileId } = await params;

  const file = await prisma.uploadedFile.findFirst({
    where: { id: fileId, userId },
    select: {
      originalName: true,
      mimeType: true,
      gcsBucket: true,
      gcsObjectPath: true,
    },
  });

  if (!file) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const storage = getGcsStorageClient();
    const gcsFile = storage.bucket(file.gcsBucket).file(file.gcsObjectPath);
    const nodeStream = gcsFile.createReadStream();
    const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

    const safeFilename = file.originalName.replace(/["\\]/g, "_");

    return new Response(webStream, {
      headers: {
        "content-type": file.mimeType || "application/octet-stream",
        "content-disposition": `inline; filename="${safeFilename}"`,
        "cache-control": "private, max-age=0, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not stream file from storage." },
      { status: 500 },
    );
  }
}
