import { UserPsyche } from './durable-object';

export interface Env {
  USER_PSYCHE: DurableObjectNamespace;
  VECTORIZE: VectorizeIndex;
  AI: Ai;
  ENVIRONMENT: string;
}

function validateJWT(token: string): { valid: boolean; userId?: string } {
  try {
    if (!token || token.length === 0) {
      return { valid: false };
    }
    // TODO: Decode and verify JWT against NextAuth secret
    return { valid: true, userId: 'placeholder_user_id' };
  } catch (error) {
    console.error('JWT validation failed:', error);
    return { valid: false };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (pathname === '/api/ws') {
      return handleWebSocket(request, env);
    }

    if (pathname === '/api/init' && request.method === 'POST') {
      return handleInit(request, env);
    }

    if (pathname.startsWith('/api/psyche/')) {
      return handlePsycheRequest(request, env);
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};

async function handleWebSocket(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.replace('Bearer ', '');
  const { valid, userId } = validateJWT(token);

  if (!valid || !userId) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (request.headers.get('Upgrade') !== 'websocket') {
    return new Response(JSON.stringify({ error: 'Expected WebSocket upgrade' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const stub = env.USER_PSYCHE.get(userId);
    return stub.fetch(request);
  } catch (error) {
    console.error('WebSocket upgrade failed:', error);
    return new Response(JSON.stringify({ error: 'WebSocket upgrade failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleInit(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.replace('Bearer ', '');
  const { valid, userId } = validateJWT(token);

  if (!valid || !userId) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stub = env.USER_PSYCHE.get(userId);
    const response = await stub.fetch(new Request('http://internal/api/init', {
      method: 'POST',
      body: JSON.stringify({ userId, email }),
    }));

    return response;
  } catch (error) {
    console.error('Init failed:', error);
    return new Response(JSON.stringify({ error: 'Init failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handlePsycheRequest(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.replace('Bearer ', '');
  const { valid, userId } = validateJWT(token);

  if (!valid || !userId) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const stub = env.USER_PSYCHE.get(userId);
    return stub.fetch(request);
  } catch (error) {
    console.error('Psyche request failed:', error);
    return new Response(JSON.stringify({ error: 'Request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export { UserPsyche };
