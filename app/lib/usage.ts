import { prisma } from '@/app/lib/db';
import { SubscriptionTier } from '@prisma/client';
import { getFilePolicyForTier } from '@/app/lib/filePolicy';

/**
 * Get the current user's subscription tier
 */
export async function getUserSubscriptionTier(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { tier: true, isActive: true, usageLimit: true, mapLimit: true, resetPeriod: true },
  });

  if (!subscription || !subscription.isActive) {
    return {
      tier: SubscriptionTier.FREE,
      isActive: false,
      usageLimit: 8, // Free tier default (weekly)
      mapLimit: 2, // Free tier default maps (from Plans.md)
      resetPeriod: 'week',
    };
  }

  // Creator and Pro tiers have unlimited maps
  const mapLimit = subscription.tier === SubscriptionTier.CREATOR || subscription.tier === SubscriptionTier.PRO 
    ? Infinity 
    : subscription.mapLimit;

  return {
    tier: subscription.tier,
    isActive: true,
    usageLimit: subscription.usageLimit,
    mapLimit,
    resetPeriod: 'week' as const,
  };
}

/**
 * Get the current user's usage count for the current period
 */
export async function getUserUsageCount(userId: string, resetPeriod: 'week' | 'month' = 'week') {
  const now = new Date();
  let startDate = new Date(now);

  if (resetPeriod === 'week') {
    // Start of current week (Monday)
    const dayOfWeek = now.getDay() || 7; // 1 for Monday, 7 for Sunday
    startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek + 1);
    startDate.setHours(0, 0, 0, 0);
  } else {
    // Start of current month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const count = await prisma.usageRecord.count({
    where: {
      userId,
      usageDate: {
        gte: startDate,
      },
    },
  });

  return count;
}

/**
 * Check if user has exceeded their usage limit
 */
export async function checkUsageLimit(userId: string) {
  const subscription = await getUserSubscriptionTier(userId);
  
  if (!subscription.isActive) {
    // Free tier - check weekly limit
    const usage = await getUserUsageCount(userId, 'week');
    return {
      allowed: usage < 8,
      usage,
      limit: 8,
      tier: SubscriptionTier.FREE,
    };
  }

  const usage = await getUserUsageCount(userId, 'week');
  
  return {
    allowed: usage < subscription.usageLimit,
    usage,
    limit: subscription.usageLimit,
    tier: subscription.tier,
  };
}

/**
 * Record a usage for the user
 */
export async function recordUsage(userId: string, generationId: string) {
  return prisma.usageRecord.create({
    data: {
      userId,
      generationId,
    },
  });
}

/**
 * Get the current user's map count
 */
export async function getUserMapCount(userId: string) {
  return prisma.map.count({
    where: { userId },
  });
}

/**
 * Check if user has exceeded their map limit
 */
export async function checkMapLimit(userId: string) {
  const subscription = await getUserSubscriptionTier(userId);
  const mapCount = await getUserMapCount(userId);
  
  // Creator and Pro tiers have unlimited maps
  const isUnlimited = subscription.mapLimit === Infinity;
  
  return {
    allowed: isUnlimited || mapCount < subscription.mapLimit,
    currentMaps: mapCount,
    limit: subscription.mapLimit,
    tier: subscription.tier,
    isUnlimited,
  };
}

/**
 * Get usage data for dashboard
 */
export async function getUsageData(userId: string) {
  const subscription = await getUserSubscriptionTier(userId);
  
  const currentUsage = await getUserUsageCount(userId, 'week');
  const mapCount = await getUserMapCount(userId);

  return {
    currentUsage,
    limit: subscription.usageLimit,
    tier: subscription.tier,
    resetPeriod: subscription.resetPeriod,
    dailyUsage: [],
    currentMaps: mapCount,
    mapLimit: subscription.mapLimit === Infinity ? null : subscription.mapLimit,
  };
}

export async function getUserStorageUsageBytes(userId: string) {
  const aggregate = await prisma.uploadedFile.aggregate({
    where: { userId },
    _sum: { sizeBytes: true },
  });

  return Number(aggregate._sum.sizeBytes ?? BigInt(0));
}

export async function checkStorageLimit(userId: string, incomingBytes = 0) {
  const subscription = await getUserSubscriptionTier(userId);
  const policy = getFilePolicyForTier(subscription.tier);
  const usedBytes = await getUserStorageUsageBytes(userId);

  const allowedByFeature = policy.dataNodeFileUploadEnabled;
  const allowedByQuota =
    policy.maxStorageBytes > 0 &&
    usedBytes + Math.max(0, incomingBytes) <= policy.maxStorageBytes;

  return {
    allowed: allowedByFeature && allowedByQuota,
    tier: subscription.tier,
    usedBytes,
    maxStorageBytes: policy.maxStorageBytes,
    remainingBytes: Math.max(policy.maxStorageBytes - usedBytes, 0),
    policy,
  };
}
