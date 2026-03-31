import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { buildDynamicSystemPrompt } from '@/lib/elevenlabs';

// Server-side token builder (mirrors lib/cloudflare.ts but uses Buffer for Node)
function buildWorkerToken(userId: string, email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({ userId, email, exp: Math.floor(Date.now() / 1000) + 3600 })
  ).toString('base64');
  return `${header}.${payload}.nosig`;
}

async function fetchWorker(path: string, token: string, options: RequestInit = {}) {
  const base = process.env.WORKER_URL ||
    process.env.NEXT_PUBLIC_WORKER_URL ||
    'http://localhost:8787';
  return fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_FACILITATOR_AGENT_ID;
  if (!agentId) {
    return NextResponse.json({ error: 'Agent ID not configured' }, { status: 500 });
  }

  let body: any = {};
  try { body = await request.json(); } catch {}
  const language: 'en' | 'es' = body.language || 'en';

  // ── Fetch user history from DO ──────────────────────────
  const userId = (session.user as any).id || session.user.email || '';
  const email = session.user.email || '';
  const userName = session.user.name?.split(' ')[0] || 'there';
  const token = buildWorkerToken(userId, email);

  let sessionCount = 0;
  let recentSummaries: string[] = [];

  try {
    const res = await fetchWorker('/api/psyche/api/sessions', token);
    if (res.ok) {
      const data = await res.json() as { sessions: Array<{ summary?: string }> };
      const sessions = data.sessions || [];
      sessionCount = sessions.length;
      // Grab the last 3 summaries that exist
      recentSummaries = sessions
        .slice(-3)
        .map((s) => s.summary)
        .filter((s): s is string => Boolean(s));
    }
  } catch (err) {
    // DO unreachable — fall back gracefully to session 1 behaviour
    console.warn('[Parts] Could not fetch DO history, defaulting to session 1:', err);
  }

  // ── Build dynamic system prompt ──────────────────────────
  const systemPrompt = buildDynamicSystemPrompt({
    sessionCount,
    recentSummaries,
    language,
    userName,
  });

  // ── Get signed URL from ElevenLabs ───────────────────────
  try {
    const elRes = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY! } }
    );

    if (!elRes.ok) {
      console.error('[Parts] ElevenLabs signed URL error:', await elRes.text());
      return NextResponse.json({ error: 'Failed to get signed URL' }, { status: 500 });
    }

    const { signed_url } = await elRes.json() as { signed_url: string };

    return NextResponse.json({
      signedUrl: signed_url,
      agentId,
      language,
      systemPrompt,   // client uses this as override
      sessionCount,
    });
  } catch (err) {
    console.error('[Parts] Error getting signed URL:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
