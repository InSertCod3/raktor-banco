import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/db";
import { getOrCreateCurrentUserId } from "@/app/lib/currentUser";
import { getGcsStorageClient } from "@/app/lib/gcs";
import { describeFileWithGeminiFlash, getGeminiVisionModel } from "@/app/lib/llm/geminiVision";
import { checkUsageLimit, recordUsage } from "@/app/lib/usage";

const AnalyzeSchema = z.object({
  fileId: z.string().min(1),
  nodeId: z.string().min(1),
});

export async function POST(req: Request) {
  const userId = await getOrCreateCurrentUserId();
  const body = await req.json().catch(() => null);
  const parsed = AnalyzeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Analysis consumes generation quota
  const usageCheck = await checkUsageLimit(userId);
  if (!usageCheck.allowed) {
    return NextResponse.json(
      {
        error: "Usage limit exceeded",
        limit: usageCheck.limit,
        currentUsage: usageCheck.usage,
        tier: usageCheck.tier,
        upgradeUrl: "/pricing",
      },
      { status: 429 },
    );
  }

  const file = await prisma.uploadedFile.findFirst({
    where: { id: parsed.data.fileId, userId },
    select: {
      id: true,
      originalName: true,
      mimeType: true,
      gcsBucket: true,
      gcsObjectPath: true,
    },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const node = await prisma.node.findFirst({
    where: {
      id: parsed.data.nodeId,
      map: { userId },
    },
    select: { id: true },
  });

  if (!node) {
    return NextResponse.json({ error: "Node not found." }, { status: 404 });
  }

  try {
    const storage = getGcsStorageClient();
    const gcsFile = storage.bucket(file.gcsBucket).file(file.gcsObjectPath);
    const [bytes] = await gcsFile.download();
    const analysisInstruction =
      file.mimeType === "application/pdf"
        ? [
            "Analyze this PDF thoroughly.",
            "Extract as much readable text as possible (OCR-style) and include key details exactly when clear.",
            "Then provide content understanding.",
            "Return plain text with these sections in order:",
            "1) OCR Text",
            "2) Content Description",
            "3) Understanding",
            "If a section has no data, write: Not available.",
          ].join(" ")
        : [
            "Analyze this image thoroughly.",
            "Read and extract all visible text (OCR-style), including labels, headings, numbers, and key phrases.",
            "Then describe the visual content and provide contextual understanding.",
            "Return plain text with these sections in order:",
            "1) OCR Text",
            "2) Content Description",
            "3) Understanding",
            "If a section has no data, write: Not available.",
          ].join(" ");

    const description = await describeFileWithGeminiFlash({
      mimeType: file.mimeType,
      bytes,
      instruction: analysisInstruction,
    });

    if (!description) {
      return NextResponse.json(
        { error: "Could not generate description for this file type." },
        { status: 400 },
      );
    }

    // Track analyze action as a generation so quota applies consistently.
    const generation = await prisma.generatedContent.create({
      data: {
        nodeId: node.id,
        platform: "FILE_ANALYSIS",
        model: getGeminiVisionModel(),
        prompt: analysisInstruction,
        output: description,
      },
      select: { id: true },
    });

    await recordUsage(userId, generation.id);

    return NextResponse.json({
      fileId: file.id,
      description,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to analyze file." },
      { status: 500 },
    );
  }
}
