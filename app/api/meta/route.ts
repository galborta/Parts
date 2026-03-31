import { auth } from '@/lib/auth';
import { serverWorkerFetch } from '@/lib/cloudflare';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id || session.user.email || '';
  const email = session.user.email || '';
  const name = session.user.name || '';

  // Init user if needed, then get meta
  await serverWorkerFetch('/api/init', userId, email, name, {
    method: 'POST',
    body: JSON.stringify({ email, name }),
  });

  const res = await serverWorkerFetch('/api/psyche/api/meta', userId, email, name);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
