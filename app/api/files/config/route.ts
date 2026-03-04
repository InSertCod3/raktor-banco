import { NextResponse } from "next/server";
import { getOrCreateCurrentUserId } from "@/app/lib/currentUser";
import { getUserSubscriptionTier, getUserStorageUsageBytes } from "@/app/lib/usage";
import { getFilePolicyForTier } from "@/app/lib/filePolicy";

export async function GET() {
  const userId = await getOrCreateCurrentUserId();
  const subscription = await getUserSubscriptionTier(userId);
  const policy = getFilePolicyForTier(subscription.tier);
  const usedBytes = await getUserStorageUsageBytes(userId);

  return NextResponse.json({
    tier: subscription.tier,
    dataNodeFileUploadEnabled: policy.dataNodeFileUploadEnabled,
    maxStorageBytes: policy.maxStorageBytes,
    usedBytes,
    remainingBytes: Math.max(policy.maxStorageBytes - usedBytes, 0),
    allowedExtensions: policy.allowedExtensions,
    allowedMimeTypes: policy.allowedMimeTypes,
  });
}
