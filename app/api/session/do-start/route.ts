import { auth } from '@/lib/auth';
import { serverWorkerFetch } from '@/lib/cloudflare';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id || session.user.email || '';
  const email = session.user.email || '';
  const name = session.user.name || '';

  // Ensure user is initialized
  await serverWorkerFetch('/api/init', userId, email, name, {
    method: 'POST',
    body: JSON.stringify({ userId, email }),
  });

  // Create session in DO
  const res = await serverWorkerFetch('/api/psyche/api/session/start', userId, email, name, {
    method: 'POST',
    body: JSON.stringify({ primaryPartId: 'free' }),
  });

  const data = await res.json() as { session?: { id: string } };
  return NextResponse.json({ sessionId: data?.session?.id }, { status: res.status });
}
