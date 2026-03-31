import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

function buildWorkerToken(userId: string, email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({ userId, email, exp: Math.floor(Date.now() / 1000) + 3600 })
  ).toString('base64');
  return `${header}.${payload}.nosig`;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any = {};
  try { body = await request.json(); } catch {}

  const { sessionId, transcript, summary } = body as {
    sessionId?: string;
    transcript?: any[];
    summary?: string;
  };

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
  }

  const userId = (session.user as any).id || session.user.email || '';
  const email = session.user.email || '';
  const token = buildWorkerToken(userId, email);

  const base = process.env.WORKER_URL ||
    process.env.NEXT_PUBLIC_WORKER_URL ||
    'http://localhost:8787';

  try {
    // 1. End the session in the DO (saves transcript, updates part stats)
    const endRes = await fetch(`${base}/api/psyche/api/session/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId, transcript }),
    });

    if (!endRes.ok) {
      console.error('[Parts] DO session/end failed:', await endRes.text());
    }

    // 2. If a summary was generated client-side, persist it into the session index
    if (summary) {
      // Patch the session index entry — DO stores it via the same endpoint
      // We re-use the existing end handler which already updates the index;
      // summary is stored directly by updating session storage key
      await fetch(`${base}/api/psyche/api/session/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId, summary }),
      }).catch(() => {/* non-critical */});
    }

    return NextResponse.json({ success: true, sessionId });
  } catch (err) {
    console.error('[Parts] session/end error:', err);
    // Return success anyway — don't fail the UX if DO save fails
    return NextResponse.json({ success: true, sessionId, warning: 'History may not have saved' });
  }
}
