/**
 * UserPsyche Durable Object
 * One per user — persistent psyche at the edge
 *
 * Storage strategy: split keys to avoid 128KB limit
 * - 'meta'           → UserMeta
 * - 'parts'          → Part[]
 * - 'session:{id}'   → Session
 * - 'session_index'  → SessionIndexEntry[]
 * - 'insights'       → Insight[]
 * - 'score'          → ScoreHistory
 */

import { getVoiceForArchetype } from '../lib/voices';

interface UserMeta {
  userId: string;
  email: string;
  language: 'en' | 'es';
  createdAt: string;
  onboarding: { completed: boolean; currentStep: number };
}

interface Part {
  id: string;
  name: string;
  archetype: string;
  voiceId: string;
  role: string;
  fear: string;
  protects: string[];
  description: string;
  personality: string;
  wounds: string[];
  gifts: string[];
  dialogueHistory: any[];
  discoveredAt: string;
  lastSpokenTo: string;
  sessionCount: number;
  unburdened: boolean;
}

interface SessionIndexEntry {
  id: string;
  startedAt: string;
  primaryPartId: string;
  duration?: number;
  summary?: string;
}

export class UserPsyche {
  private state: DurableObjectState;
  private env: any;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocketUpgrade(request);
    }

    // Route handlers
    if (pathname === '/api/init' && request.method === 'POST') return this.handleInit(request);
    if (pathname === '/api/meta' && request.method === 'GET') return this.handleGetMeta();
    if (pathname === '/api/parts' && request.method === 'GET') return this.handleGetParts();
    if (pathname === '/api/parts' && request.method === 'POST') return this.handleAddPart(request);
    if (pathname === '/api/language' && request.method === 'PATCH') return this.handleUpdateLanguage(request);
    if (pathname === '/api/session/start' && request.method === 'POST') return this.handleStartSession(request);
    if (pathname === '/api/session/end' && request.method === 'POST') return this.handleEndSession(request);
    if (pathname === '/api/sessions' && request.method === 'GET') return this.handleGetSessions();
    if (pathname === '/api/insights' && request.method === 'GET') return this.handleGetInsights();
    if (pathname === '/api/onboarding/complete' && request.method === 'POST') return this.handleCompleteOnboarding();

    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  // ── WebSocket ────────────────────────────────────────────

  private async handleWebSocketUpgrade(request: Request): Promise<Response> {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    server.accept();
    server.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data as string);
        const { type, payload } = message;

        switch (type) {
          case 'start_session': {
            const sessionId = crypto.randomUUID();
            server.send(JSON.stringify({
              type: 'session_started',
              data: { sessionId },
            }));
            break;
          }
          case 'end_session': {
            server.send(JSON.stringify({
              type: 'session_ended',
              data: { sessionId: payload.sessionId, timestamp: new Date().toISOString() },
            }));
            break;
          }
          default:
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

  // ── Init ─────────────────────────────────────────────────

  private async handleInit(request: Request): Promise<Response> {
    const { userId, email } = await request.json() as any;

    const existing = await this.state.storage.get('meta') as UserMeta | undefined;
    if (existing) {
      const parts = await this.state.storage.get('parts') as Part[] || [];
      return Response.json({ status: 'already_initialized', meta: existing, parts });
    }

    const meta: UserMeta = {
      userId,
      email,
      language: 'en',
      createdAt: new Date().toISOString(),
      onboarding: { completed: false, currentStep: 0 },
    };

    await this.state.storage.put('meta', meta);
    await this.state.storage.put('parts', []);
    await this.state.storage.put('session_index', []);
    await this.state.storage.put('insights', []);
    await this.state.storage.put('score', { current: 0, history: [] });

    return Response.json({ status: 'initialized', meta, parts: [] });
  }

  // ── Meta ─────────────────────────────────────────────────

  private async handleGetMeta(): Promise<Response> {
    const meta = await this.state.storage.get('meta') as UserMeta | undefined;
    if (!meta) return Response.json({ error: 'User not initialized' }, { status: 404 });
    return Response.json({ meta });
  }

  // ── Language ─────────────────────────────────────────────

  private async handleUpdateLanguage(request: Request): Promise<Response> {
    const { language } = await request.json() as { language: 'en' | 'es' };
    const meta = await this.state.storage.get('meta') as UserMeta | undefined;
    if (!meta) return Response.json({ error: 'User not initialized' }, { status: 404 });

    meta.language = language;
    await this.state.storage.put('meta', meta);
    return Response.json({ meta });
  }

  // ── Parts ────────────────────────────────────────────────

  private async handleGetParts(): Promise<Response> {
    const parts = await this.state.storage.get('parts') as Part[] || [];
    return Response.json({ parts });
  }

  private async handleAddPart(request: Request): Promise<Response> {
    const { name, archetype, description, personality, role, fear } = await request.json() as any;
    const parts = await this.state.storage.get('parts') as Part[] || [];

    const newPart: Part = {
      id: crypto.randomUUID(),
      name,
      archetype,
      voiceId: getVoiceForArchetype(archetype),
      role: role || '',
      fear: fear || '',
      protects: [],
      description: description || '',
      personality: personality || '',
      wounds: [],
      gifts: [],
      dialogueHistory: [],
      discoveredAt: new Date().toISOString(),
      lastSpokenTo: '',
      sessionCount: 0,
      unburdened: false,
    };

    parts.push(newPart);
    await this.state.storage.put('parts', parts);

    return Response.json({ part: newPart }, { status: 201 });
  }

  // ── Sessions ─────────────────────────────────────────────

  private async handleStartSession(request: Request): Promise<Response> {
    const { primaryPartId } = await request.json() as any;
    const score = await this.state.storage.get('score') as any || { current: 0, history: [] };

    const session = {
      id: crypto.randomUUID(),
      primaryPartId,
      startedAt: new Date().toISOString(),
      transcript: [],
      insights: [],
      selfLeadershipBefore: score.current,
      selfLeadershipAfter: score.current,
    };

    // Store the session
    await this.state.storage.put(`session:${session.id}`, session);

    // Update session index
    const index = await this.state.storage.get('session_index') as SessionIndexEntry[] || [];
    index.push({
      id: session.id,
      startedAt: session.startedAt,
      primaryPartId,
    });
    await this.state.storage.put('session_index', index);

    return Response.json({ session }, { status: 201 });
  }

  private async handleEndSession(request: Request): Promise<Response> {
    const { sessionId, transcript } = await request.json() as any;

    const session = await this.state.storage.get(`session:${sessionId}`) as any;
    if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });

    session.endedAt = new Date().toISOString();
    session.duration = Math.round(
      (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000
    );
    if (transcript) {
      session.transcript = transcript;
    }

    await this.state.storage.put(`session:${sessionId}`, session);

    // Update session index with duration
    const index = await this.state.storage.get('session_index') as SessionIndexEntry[] || [];
    const entry = index.find((e: SessionIndexEntry) => e.id === sessionId);
    if (entry) {
      entry.duration = session.duration;
      await this.state.storage.put('session_index', index);
    }

    // Increment part's session count
    const parts = await this.state.storage.get('parts') as Part[] || [];
    const part = parts.find(p => p.id === session.primaryPartId);
    if (part) {
      part.sessionCount++;
      part.lastSpokenTo = new Date().toISOString();
      await this.state.storage.put('parts', parts);
    }

    return Response.json({ session });
  }

  private async handleGetSessions(): Promise<Response> {
    const index = await this.state.storage.get('session_index') as SessionIndexEntry[] || [];
    return Response.json({ sessions: index });
  }

  // ── Insights ─────────────────────────────────────────────

  private async handleGetInsights(): Promise<Response> {
    const insights = await this.state.storage.get('insights') || [];
    return Response.json({ insights });
  }

  // ── Onboarding ───────────────────────────────────────────

  private async handleCompleteOnboarding(): Promise<Response> {
    const meta = await this.state.storage.get('meta') as UserMeta | undefined;
    if (!meta) return Response.json({ error: 'User not initialized' }, { status: 404 });

    meta.onboarding.completed = true;
    await this.state.storage.put('meta', meta);
    return Response.json({ meta });
  }
}
