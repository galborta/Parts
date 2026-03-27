import { UserPsyche } from './durable-object';

export interface Env {
  USER_PSYCHE: DurableObjectNamespace;
  AI: Ai;
  NEXTAUTH_SECRET: string;
  ENVIRONMENT: string;
}

/**
 * Validate JWT from NextAuth.
 * For the hackathon, we do a basic base64 decode of the JWT payload.
 * In production, verify the signature against NEXTAUTH_SECRET.
 */
function validateJWT(token: string, secret?: string): { valid: boolean; userId?: string; email?: string } {
  try {
    if (!token || token.length === 0) {
      return { valid: false };
    }

    // Decode JWT payload (middle segment)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false };
    }

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const userId = payload.userId || payload.sub;

    if (!userId) {
      return { valid: false };
    }

    // Check expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return { valid: false };
    }

    return { valid: true, userId, email: payload.email };
  } catch {
    return { valid: false };
  }
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function authenticateRequest(request: Request, env: Env): { valid: boolean; userId?: string; email?: string } {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return { valid: false };

  const token = authHeader.replace('Bearer ', '');
  return validateJWT(token, env.NEXTAUTH_SECRET);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    // Health check
    if (pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // All other routes require auth
    const auth = authenticateRequest(request, env);
    if (!auth.valid || !auth.userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // Get the user's Durable Object (deterministic by userId)
    const doId = env.USER_PSYCHE.idFromName(auth.userId);
    const stub = env.USER_PSYCHE.get(doId);

    try {
      // WebSocket upgrade
      if (pathname === '/api/ws') {
        if (request.headers.get('Upgrade') !== 'websocket') {
          return new Response(JSON.stringify({ error: 'Expected WebSocket upgrade' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders() },
          });
        }
        return stub.fetch(request);
      }

      // Init
      if (pathname === '/api/init' && request.method === 'POST') {
        const body = await request.json() as any;
        const res = await stub.fetch(new Request('http://internal/api/init', {
          method: 'POST',
          body: JSON.stringify({ userId: auth.userId, email: body.email || auth.email }),
        }));
        const data = await res.json();
        return new Response(JSON.stringify(data), {
          status: res.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      // Proxy all /api/psyche/* requests to the DO
      if (pathname.startsWith('/api/psyche/')) {
        const doPath = pathname.replace('/api/psyche', '');
        const doRequest = new Request(`http://internal${doPath}`, {
          method: request.method,
          headers: request.headers,
          body: request.method !== 'GET' ? request.body : undefined,
        });
        const res = await stub.fetch(doRequest);
        const data = await res.json();
        return new Response(JSON.stringify(data), {
          status: res.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }
  },
};

export { UserPsyche };
