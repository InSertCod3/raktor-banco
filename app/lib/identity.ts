import { auth } from '@clerk/nextjs/server';

/**
 * Get current user ID from Clerk authentication
 * Returns null if user is not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId: clerkUserId } = await auth();
  return clerkUserId;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await auth();
  return !!userId;
}
