/**
 * UserPsyche Durable Object
 * One per user — persistent psyche at the edge
 */

export class UserPsyche {
  private state: DurableObjectState;
  private env: any;
  private userId: string;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
    this.userId = '';
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocketUpgrade(request);
    }

    if (pathname === '/api/init' && request.method === 'POST') {
      return this.handleInit(request);
    }

    if (pathname === '/api/parts' && request.method === 'GET') {
      return this.handleGetParts();
    }

    if (pathname === '/api/parts' && request.method === 'POST') {
      return this.handleAddPart(request);
    }

    if (pathname === '/api/session/start' && request.method === 'POST') {
      return this.handleStartSession(request);
    }

    if (pathname === '/api/session/end' && request.method === 'POST') {
      return this.handleEndSession(request);
    }

    if (pathname === '/api/insights' && request.method === 'GET') {
      return this.handleGetInsights();
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async handleWebSocketUpgrade(request: Request): Promise<Response> {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    server.accept();
    server.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data as string);
        const { type, payload } = message;

        switch (type) {
          case 'start_session':
            server.send(JSON.stringify({
              type: 'session_started',
              data: { sessionId: crypto.randomUUID() },
            }));
            break;
          case 'send_message':
            // TODO: Route to Workers AI for part response generation
            // TODO: Stream TTS via ElevenLabs for part voice
            server.send(JSON.stringify({
              type: 'message_received',
              data: {
                sessionId: payload.sessionId,
                partResponse: 'Placeholder — Workers AI response here',
                timestamp: new Date().toISOString(),
              },
            }));
            break;
          case 'end_session':
            server.send(JSON.stringify({
              type: 'session_ended',
              data: { sessionId: payload.sessionId, timestamp: new Date().toISOString() },
            }));
            break;
          default:
            server.send(JSON.stringify({ error: 'Unknown message type' }));
        }
      } catch (error) {
        server.send(JSON.stringify({ error: 'Message handling failed' }));
      }
    });

    server.addEventListener('close', () => server.close());
    server.addEventListener('error', () => server.close());

    return new Response(null, { status: 101, webSocket: client });
  }

  private async handleInit(request: Request): Promise<Response> {
    const { userId, email } = await request.json() as any;
    this.userId = userId;

    const existing = await this.state.storage.get('user_psyche');
    if (existing) {
      return Response.json({ status: 'already_initialized', user: existing });
    }

    const userPsyche = {
      userId,
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parts: [],
      sessions: [],
      insights: [],
      selfLeadershipScore: 0,
      onboarding: { completed: false, currentStep: 0 },
    };

    await this.state.storage.put('user_psyche', userPsyche);
    return Response.json({ status: 'initialized', user: userPsyche });
  }

  private async handleGetParts(): Promise<Response> {
    const data = await this.state.storage.get('user_psyche') as any;
    if (!data) return Response.json({ error: 'User not initialized' }, { status: 404 });
    return Response.json({ parts: data.parts || [] });
  }

  private async handleAddPart(request: Request): Promise<Response> {
    const { name, archetype, description, personality } = await request.json() as any;
    const data = await this.state.storage.get('user_psyche') as any;
    if (!data) return Response.json({ error: 'User not initialized' }, { status: 404 });

    const newPart = {
      id: crypto.randomUUID(),
      name,
      archetype,
      voiceId: '', // TODO: Auto-assign from voices.ts mapping
      description,
      personality,
      wounds: [],
      gifts: [],
      dialogueHistory: [],
      discoveredAt: new Date().toISOString(),
      lastSpokenTo: '',
      sessionCount: 0,
      unburdened: false,
    };

    data.parts.push(newPart);
    data.updatedAt = new Date().toISOString();
    await this.state.storage.put('user_psyche', data);

    return Response.json({ part: newPart }, { status: 201 });
  }

  private async handleStartSession(request: Request): Promise<Response> {
    const { partIds } = await request.json() as any;
    const data = await this.state.storage.get('user_psyche') as any;
    if (!data) return Response.json({ error: 'User not initialized' }, { status: 404 });

    const newSession = {
      id: crypto.randomUUID(),
      userId: this.userId,
      partIds,
      startedAt: new Date().toISOString(),
      transcript: [],
      keyInsights: [],
    };

    data.sessions.push(newSession);
    await this.state.storage.put('user_psyche', data);
    return Response.json({ session: newSession }, { status: 201 });
  }

  private async handleEndSession(request: Request): Promise<Response> {
    const { sessionId } = await request.json() as any;
    const data = await this.state.storage.get('user_psyche') as any;
    if (!data) return Response.json({ error: 'User not initialized' }, { status: 404 });

    const session = data.sessions.find((s: any) => s.id === sessionId);
    if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });

    session.endedAt = new Date().toISOString();
    session.duration = Math.round(
      (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000
    );
    data.updatedAt = new Date().toISOString();

    // TODO: Generate session summary via Workers AI
    // TODO: Extract insights and embed via Vectorize

    await this.state.storage.put('user_psyche', data);
    return Response.json({ session });
  }

  private async handleGetInsights(): Promise<Response> {
    const data = await this.state.storage.get('user_psyche') as any;
    if (!data) return Response.json({ error: 'User not initialized' }, { status: 404 });
    return Response.json({ insights: data.insights || [] });
  }
}
