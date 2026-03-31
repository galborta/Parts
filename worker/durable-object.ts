/**
 * Baseline Durable Object
 * One per user — persistent recovery data at the edge
 *
 * Storage keys:
 * - 'meta'           → UserMeta
 * - 'session:{id}'   → Session
 * - 'session_index'  → SessionIndexEntry[]
 * - 'insights'       → Insight[]
 * - 'score'          → ScoreHistory
 */

import { DurableObject } from 'cloudflare:workers';

interface UserMeta {
  userId: string;
  email: string;
  language: 'en' | 'es';
  createdAt: string;
  onboarding: { completed: boolean; currentStep: number };
  sessionCount: number;
  streak: number;
  lastSessionDate: string;
}

interface SessionIndexEntry {
  id: string;
  startedAt: string;
  voiceId: string;
  duration?: number;
  summary?: string;
}

interface Env {
  AI: Ai;
}

export class UserPsyche extends DurableObject<Env> {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocketUpgrade(request);
    }

    if (pathname === '/api/init'             && request.method === 'POST')  return this.handleInit(request);
    if (pathname === '/api/meta'             && request.method === 'GET')   return this.handleGetMeta();
    if (pathname === '/api/language'         && request.method === 'PATCH') return this.handleUpdateLanguage(request);
    if (pathname === '/api/session/start'    && request.method === 'POST')  return this.handleStartSession(request);
    if (pathname === '/api/session/end'      && request.method === 'POST')  return this.handleEndSession(request);
    if (pathname === '/api/session/summary'  && request.method === 'POST')  return this.handleSaveSessionSummary(request);
    if (pathname === '/api/sessions'         && request.method === 'GET')   return this.handleGetSessions();
    if (pathname === '/api/insights'         && request.method === 'GET')   return this.handleGetInsights();
    if (pathname === '/api/progress'         && request.method === 'GET')   return this.handleGetProgress();
    if (pathname === '/api/reset'            && request.method === 'POST')  return this.handleReset();
    if (pathname === '/api/onboarding/complete' && request.method === 'POST') return this.handleCompleteOnboarding();

    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  // ── WebSocket ─────────────────────────────────────────────
  private async handleWebSocketUpgrade(request: Request): Promise<Response> {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    server.addEventListener('message', async (event) => {
      try {
        const { type, payload } = JSON.parse(event.data as string);
        if (type === 'start_session') {
          server.send(JSON.stringify({ type: 'session_started', data: { sessionId: crypto.randomUUID() } }));
        } else if (type === 'end_session') {
          server.send(JSON.stringify({ type: 'session_ended', data: { sessionId: payload?.sessionId, timestamp: new Date().toISOString() } }));
        } else {
          server.send(JSON.stringify({ type: 'error', data: { message: 'Unknown message type' } }));
        }
      } catch {
        server.send(JSON.stringify({ type: 'error', data: { message: 'Message handling failed' } }));
      }
    });
    server.addEventListener('close', () => server.close());
    server.addEventListener('error', () => server.close());
    return new Response(null, { status: 101, webSocket: client });
  }

  // ── Init ──────────────────────────────────────────────────
  private async handleInit(request: Request): Promise<Response> {
    const { userId, email } = await request.json() as any;
    const existing = await this.ctx.storage.get('meta') as UserMeta | undefined;
    if (existing) {
      // Backfill fields added after initial creation
      let needsSave = false;
      if (existing.sessionCount === undefined) {
        const index = await this.ctx.storage.get('session_index') as SessionIndexEntry[] || [];
        existing.sessionCount = index.length;
        existing.streak = existing.streak || 0;
        existing.lastSessionDate = existing.lastSessionDate || '';
        needsSave = true;
      }
      if (needsSave) await this.ctx.storage.put('meta', existing);
      return Response.json({ status: 'already_initialized', meta: existing });
    }
    const meta: UserMeta = {
      userId, email,
      language: 'en',
      createdAt: new Date().toISOString(),
      onboarding: { completed: false, currentStep: 0 },
      sessionCount: 0,
      streak: 0,
      lastSessionDate: '',
    };
    await this.ctx.storage.put('meta', meta);
    await this.ctx.storage.put('session_index', []);
    await this.ctx.storage.put('insights', []);
    await this.ctx.storage.put('score', { current: { exhaustion: 50, cynicism: 50, efficacy: 50 }, recoveryIndex: 50, phase: 1, history: [] });
    return Response.json({ status: 'initialized', meta });
  }

  // ── Meta ──────────────────────────────────────────────────
  private async handleGetMeta(): Promise<Response> {
    const meta = await this.ctx.storage.get('meta') as UserMeta | undefined;
    if (!meta) return Response.json({ error: 'User not initialized' }, { status: 404 });
    return Response.json({ meta });
  }

  // ── Language ──────────────────────────────────────────────
  private async handleUpdateLanguage(request: Request): Promise<Response> {
    const { language } = await request.json() as { language: 'en' | 'es' };
    const meta = await this.ctx.storage.get('meta') as UserMeta | undefined;
    if (!meta) return Response.json({ error: 'User not initialized' }, { status: 404 });
    meta.language = language;
    await this.ctx.storage.put('meta', meta);
    return Response.json({ meta });
  }

  // ── Sessions ──────────────────────────────────────────────
  private async handleStartSession(request: Request): Promise<Response> {
    const { primaryPartId } = await request.json() as any;
    const session = {
      id: crypto.randomUUID(),
      voiceId: primaryPartId || 'free',
      startedAt: new Date().toISOString(),
      transcript: [],
    };
    await this.ctx.storage.put(`session:${session.id}`, session);
    const index = await this.ctx.storage.get('session_index') as SessionIndexEntry[] || [];
    index.push({ id: session.id, startedAt: session.startedAt, voiceId: session.voiceId });
    await this.ctx.storage.put('session_index', index);
    return Response.json({ session }, { status: 201 });
  }

  private async handleEndSession(request: Request): Promise<Response> {
    const { sessionId, transcript } = await request.json() as any;
    const session = await this.ctx.storage.get(`session:${sessionId}`) as any;
    if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });

    session.endedAt = new Date().toISOString();
    session.duration = Math.round(
      (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000
    );
    if (transcript) session.transcript = transcript;
    await this.ctx.storage.put(`session:${sessionId}`, session);

    // Update index with duration
    const index = await this.ctx.storage.get('session_index') as SessionIndexEntry[] || [];
    const entry = index.find((e) => e.id === sessionId);
    if (entry) {
      entry.duration = session.duration;
      await this.ctx.storage.put('session_index', index);
    }

    // Update meta: sessionCount, streak, lastSessionDate
    const meta = await this.ctx.storage.get('meta') as UserMeta | undefined;
    if (meta) {
      const todayStr = new Date().toISOString().slice(0, 10);
      if (meta.lastSessionDate !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);
        meta.streak = meta.lastSessionDate === yesterdayStr ? (meta.streak || 0) + 1 : 1;
        meta.lastSessionDate = todayStr;
      }
      meta.sessionCount = (meta.sessionCount || 0) + 1;
      await this.ctx.storage.put('meta', meta);
    }

    return Response.json({ session });
  }

  private async handleSaveSessionSummary(request: Request): Promise<Response> {
    const { sessionId, summary } = await request.json() as { sessionId: string; summary: string };
    const index = await this.ctx.storage.get('session_index') as SessionIndexEntry[] || [];
    const entry = index.find((e) => e.id === sessionId);
    if (entry && summary) {
      entry.summary = summary;
      await this.ctx.storage.put('session_index', index);
    }
    const session = await this.ctx.storage.get(`session:${sessionId}`) as any;
    if (session && summary) {
      session.summary = summary;
      await this.ctx.storage.put(`session:${sessionId}`, session);
    }
    return Response.json({ ok: true });
  }

  private async handleGetSessions(): Promise<Response> {
    const index = await this.ctx.storage.get('session_index') as SessionIndexEntry[] || [];
    return Response.json({ sessions: index });
  }

  // ── Insights ──────────────────────────────────────────────
  private async handleGetInsights(): Promise<Response> {
    const insights = await this.ctx.storage.get('insights') || [];
    return Response.json({ insights });
  }

  // ── Progress ──────────────────────────────────────────────
  private async handleGetProgress(): Promise<Response> {
    const meta = await this.ctx.storage.get('meta') as UserMeta | undefined;
    if (!meta) return Response.json({ error: 'User not initialized' }, { status: 404 });

    const index = await this.ctx.storage.get('session_index') as SessionIndexEntry[] || [];
    const totalSessions = index.length;

    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySessions = index.filter((s) => s.startedAt.slice(0, 10) === todayStr);

    const recentSessions = index
      .filter((s) => s.summary)
      .slice(-30);

    return Response.json({
      sessionCount: totalSessions,
      streak: meta.streak || 0,
      lastSessionDate: meta.lastSessionDate || '',
      todaySessionCount: todaySessions.length,
      todaySummaries: todaySessions
        .map((s) => s.summary)
        .filter((s): s is string => Boolean(s)),
      recentHistory: recentSessions,
    });
  }

  // ── Reset ─────────────────────────────────────────────────
  private async handleReset(): Promise<Response> {
    await this.ctx.storage.deleteAll();
    return Response.json({ status: 'reset', message: 'All user data deleted' });
  }

  // ── Onboarding ────────────────────────────────────────────
  private async handleCompleteOnboarding(): Promise<Response> {
    const meta = await this.ctx.storage.get('meta') as UserMeta | undefined;
    if (!meta) return Response.json({ error: 'User not initialized' }, { status: 404 });
    meta.onboarding.completed = true;
    await this.ctx.storage.put('meta', meta);
    return Response.json({ meta });
  }
}
