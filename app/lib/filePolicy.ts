import { SubscriptionTier } from "@prisma/client";

export type TierFilePolicy = {
  dataNodeFileUploadEnabled: boolean;
  maxStorageBytes: number;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
};

const MB = 1024 * 1024;
const GB = 1024 * MB;

export const FILE_POLICY_BY_TIER: Record<SubscriptionTier, TierFilePolicy> = {
  FREE: {
    dataNodeFileUploadEnabled: false,
    maxStorageBytes: 0,
    allowedExtensions: [],
    allowedMimeTypes: [],
  },
  CREATOR: {
    dataNodeFileUploadEnabled: true,
    maxStorageBytes: 1 * GB,
    allowedExtensions: ["jpg", "jpeg", "png", "pdf"],
    allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
  },
  PRO: {
    dataNodeFileUploadEnabled: true,
    maxStorageBytes: 5 * GB,
    allowedExtensions: ["jpg", "jpeg", "png", "pdf"],
    allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
  },
};

export function getFilePolicyForTier(tier: SubscriptionTier): TierFilePolicy {
  return FILE_POLICY_BY_TIER[tier] ?? FILE_POLICY_BY_TIER.FREE;
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function getFileExtension(filename: string): string {
  const normalized = filename.trim().toLowerCase();
  const index = normalized.lastIndexOf(".");
  if (index < 0) return "";
  return normalized.slice(index + 1);
}
