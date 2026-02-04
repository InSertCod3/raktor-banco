import { prisma } from '@/app/lib/db';
import { getAnonKey, getOrCreateAnonKey } from '@/app/lib/identity';

/**
 * Get current user ID (read-only, for Server Components).
 * Returns null if no cookie exists yet.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const anonKey = await getAnonKey();
  if (!anonKey) return null;

  const user = await prisma.user.findUnique({
    where: { anonKey },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * Get or create current user ID (for Route Handlers - can create cookie).
 */
export async function getOrCreateCurrentUserId(): Promise<string> {
  const anonKey = await getOrCreateAnonKey();
  const user = await prisma.user.upsert({
    where: { anonKey },
    update: {},
    create: { anonKey },
    select: { id: true },
  });
  return user.id;
}


