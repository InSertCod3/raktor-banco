import { cookies } from 'next/headers';
import { generateId } from '@/app/lib/utils';

const ANON_COOKIE = 'mm_anon';

/**
 * Read-only: get anon key from cookie (for Server Components).
 * Returns null if cookie doesn't exist (cookie creation happens in Route Handlers).
 */
export async function getAnonKey(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ANON_COOKIE)?.value ?? null;
}

/**
 * Read or create anon key (for Route Handlers only - can modify cookies).
 * Server Components should use getAnonKey() instead.
 */
export async function getOrCreateAnonKey(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(ANON_COOKIE)?.value;
  if (existing) return existing;

  const anonKey = generateId(24);
  jar.set(ANON_COOKIE, anonKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  return anonKey;
}

