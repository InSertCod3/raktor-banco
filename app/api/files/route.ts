import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/db";
import { getOrCreateCurrentUserId } from "@/app/lib/currentUser";
import { getFileExtension, getFilePolicyForTier } from "@/app/lib/filePolicy";
import { checkStorageLimit, getUserStorageUsageBytes, getUserSubscriptionTier } from "@/app/lib/usage";
import {
  ensureNodeOwnership,
  toNodeAttachedFile,
  toSerializableUserFile,
  uploadFileToGcsAndPersist,
} from "@/app/lib/files";

const ListQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(200).optional(),
});

export async function GET(req: Request) {
  const userId = await getOrCreateCurrentUserId();
  const url = new URL(req.url);
  const parsed = ListQuerySchema.safeParse({
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query params." }, { status: 400 });
  }

  const files = await prisma.uploadedFile.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: parsed.data.limit ?? 100,
    select: {
      id: true,
      originalName: true,
      extension: true,
      mimeType: true,
      sizeBytes: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    items: files.map(toSerializableUserFile),
  });
}

export async function POST(req: Request) {
  const userId = await getOrCreateCurrentUserId();
  const subscription = await getUserSubscriptionTier(userId);
  const policy = getFilePolicyForTier(subscription.tier);

  if (!policy.dataNodeFileUploadEnabled) {
    return NextResponse.json(
      {
        error: "File uploads are not enabled for this tier.",
        tier: subscription.tier,
        upgradeUrl: "/pricing",
      },
      { status: 403 },
    );
  }

  const formData = await req.formData();
  const upload = formData.get("file");
  const nodeIdValue = formData.get("nodeId");
  const nodeId = typeof nodeIdValue === "string" && nodeIdValue.trim() ? nodeIdValue : undefined;

  if (!(upload instanceof File)) {
    return NextResponse.json({ error: "Missing file in form data." }, { status: 400 });
  }
  if (upload.size <= 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }

  const extension = getFileExtension(upload.name);
  if (!policy.allowedExtensions.includes(extension)) {
    return NextResponse.json(
      {
        error: `Unsupported file type. Allowed: ${policy.allowedExtensions.join(", ").toUpperCase()}.`,
      },
      { status: 400 },
    );
  }
  if (!policy.allowedMimeTypes.includes(upload.type)) {
    return NextResponse.json(
      {
        error: "Unsupported MIME type.",
      },
      { status: 400 },
    );
  }

  if (nodeId) {
    try {
      await ensureNodeOwnership(nodeId, userId);
    } catch {
      return NextResponse.json({ error: "Invalid node reference." }, { status: 404 });
    }
  }

  const storageCheck = await checkStorageLimit(userId, upload.size);
  if (!storageCheck.allowed) {
    const usedBytes = storageCheck.usedBytes;
    return NextResponse.json(
      {
        error: "Storage limit exceeded for your current tier.",
        tier: storageCheck.tier,
        usedBytes,
        maxStorageBytes: storageCheck.maxStorageBytes,
        upgradeUrl: "/pricing",
      },
      { status: 429 },
    );
  }

  const { uploaded, description } = await uploadFileToGcsAndPersist({
    userId,
    file: upload,
    nodeId,
  });

  const usedBytes = await getUserStorageUsageBytes(userId);

  return NextResponse.json(
    {
      item: toSerializableUserFile(uploaded),
      attachment: toNodeAttachedFile(uploaded, description),
      storage: {
        usedBytes,
        maxStorageBytes: policy.maxStorageBytes,
        remainingBytes: Math.max(policy.maxStorageBytes - usedBytes, 0),
      },
    },
    { status: 201 },
  );
}
