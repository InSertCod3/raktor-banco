import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/db';

/**
 * Get or create user from Clerk authentication
 */
export async function getOrCreateUserFromClerk() {
  const { userId: clerkUserId } = await auth();
  
  if (!clerkUserId) {
    throw new Error('User not authenticated');
  }
  
  let user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: { clerkUserId },
      select: { id: true },
    });
  }
  
  return user;
}

/**
 * Get current user from Clerk authentication
 */
export async function getCurrentUserFromClerk() {
  const { userId: clerkUserId } = await auth();
  
  if (!clerkUserId) return null;
  
  return prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, clerkUserId: true },
  });
}

/**
 * Get current user ID (for Server Components)
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
 * Get or create current user ID (for Route Handlers)
 * Throws error if user is not authenticated
 */
export async function getOrCreateCurrentUserId(): Promise<string> {
  const { userId: clerkUserId } = await auth();
  
  if (!clerkUserId) {
    throw new Error('User not authenticated');
  }
  
  const user = await prisma.user.upsert({
    where: { clerkUserId },
    update: {},
    create: { clerkUserId },
    select: { id: true },
  });
  
  return user.id;
}
