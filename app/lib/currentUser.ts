import { prisma } from '@/app/lib/db';
import { auth } from '@clerk/nextjs/server';

/**
 * Get current user ID from Clerk authentication
 * Returns null if user is not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId: clerkUserId } = await auth();
  
  if (!clerkUserId) return null;
  
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * Get or create current user ID from Clerk authentication
 * Creates a new user if they don't exist
 * Also creates a default subscription for new users
 */
export async function getOrCreateCurrentUserId(): Promise<string> {
  const { userId: clerkUserId } = await auth();
  
  if (!clerkUserId) {
    throw new Error('User not authenticated');
  }
  
  // First, find or create the user
  const user = await prisma.user.upsert({
    where: { clerkUserId },
    update: {},
    create: { clerkUserId },
    select: { id: true },
  });
  
  // Check if user has a subscription, if not create a free tier subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });
  
  if (!subscription) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        tier: 'FREE',
        isActive: true,
        usageLimit: 8, // Free tier: 8 generations per week
        mapLimit: 2, // Free tier: 2 maps
        resetPeriod: 'week',
      },
    });
  }
  
  return user.id;
}
