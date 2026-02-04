import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { getOrCreateAnonKey } from '@/app/lib/identity';

export async function GET() {
  const anonKey = await getOrCreateAnonKey();

  const user = await prisma.user.upsert({
    where: { anonKey },
    update: {},
    create: { anonKey },
    select: { id: true },
  });

  return NextResponse.json({ userId: user.id });
}


