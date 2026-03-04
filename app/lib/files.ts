import { randomUUID } from "crypto";
import { prisma } from "@/app/lib/db";
import { getGcsBucketName, getGcsStorageClient, getGcsUploadPrefix } from "@/app/lib/gcs";
import { getFileExtension } from "@/app/lib/filePolicy";

type UploadInput = {
  userId: string;
  file: File;
  nodeId?: string;
};

export type SerializableUserFile = {
  id: string;
  originalName: string;
  extension: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  downloadUrl: string;
};

export function toSerializableUserFile(file: {
  id: string;
  originalName: string;
  extension: string;
  mimeType: string;
  sizeBytes: bigint | number;
  createdAt: Date;
}): SerializableUserFile {
  return {
    id: file.id,
    originalName: file.originalName,
    extension: file.extension,
    mimeType: file.mimeType,
    sizeBytes: Number(file.sizeBytes),
    createdAt: file.createdAt.toISOString(),
    downloadUrl: `/api/files/${file.id}/download`,
  };
}

export function toNodeAttachedFile(
  file: {
    id: string;
    originalName: string;
    extension: string;
    mimeType: string;
    sizeBytes: bigint | number;
    createdAt: Date;
  },
  description: string | null,
) {
  return {
    ...toSerializableUserFile(file),
    description,
  };
}

export async function ensureNodeOwnership(nodeId: string, userId: string) {
  const node = await prisma.node.findFirst({
    where: {
      id: nodeId,
      map: { userId },
    },
    select: { id: true },
  });
  if (!node) {
    throw new Error("Node not found for this user.");
  }
}

export async function uploadFileToGcsAndPersist({ userId, file, nodeId }: UploadInput) {
  const extension = getFileExtension(file.name);
  const bucketName = getGcsBucketName();
  const objectName = `${getGcsUploadPrefix()}/${userId}/${randomUUID()}-${file.name.replace(/\s+/g, "_")}`;
  const storage = getGcsStorageClient();
  const bucket = storage.bucket(bucketName);
  const object = bucket.file(objectName);

  const buffer = Buffer.from(await file.arrayBuffer());

  await object.save(buffer, {
    resumable: false,
    contentType: file.type || "application/octet-stream",
    metadata: {
      cacheControl: "private, max-age=0, no-transform",
    },
  });

  try {
    const uploaded = await prisma.uploadedFile.create({
      data: {
        userId,
        originalName: file.name,
        extension,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: BigInt(file.size),
        gcsBucket: bucketName,
        gcsObjectPath: objectName,
      },
      select: {
        id: true,
        originalName: true,
        extension: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
      },
    });

    if (nodeId) {
      await prisma.nodeFileLink.create({
        data: {
          nodeId,
          fileId: uploaded.id,
        },
      });
    }

    return { uploaded, description: null as string | null };
  } catch (error) {
    await object.delete({ ignoreNotFound: true }).catch(() => {});
    throw error;
  }
}
