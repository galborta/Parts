const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8787';

async function getAuthToken(): Promise<string> {
  const res = await fetch('/api/auth/session');
  const session = await res.json();
  return session?.user?.id || '';
}

async function fetchFromWorker(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  return fetch(`${WORKER_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

export async function initUserPsyche(email: string) {
  const res = await fetchFromWorker('/api/init', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function getParts() {
  const res = await fetchFromWorker('/api/psyche/api/parts');
  return res.json();
}

export async function addPart(part: {
  name: string;
  archetype: string;
  description: string;
  personality: string;
  role?: string;
  fear?: string;
}) {
  const res = await fetchFromWorker('/api/psyche/api/parts', {
    method: 'POST',
    body: JSON.stringify(part),
  });
  return res.json();
}

export async function startSession(primaryPartId: string) {
  const res = await fetchFromWorker('/api/psyche/api/session/start', {
    method: 'POST',
    body: JSON.stringify({ primaryPartId }),
  });
  return res.json();
}

export async function endSession(sessionId: string, transcript: any[]) {
  const res = await fetchFromWorker('/api/psyche/api/session/end', {
    method: 'POST',
    body: JSON.stringify({ sessionId, transcript }),
  });
  return res.json();
}

export async function getInsights() {
  const res = await fetchFromWorker('/api/psyche/api/insights');
  return res.json();
}

export async function updateLanguage(language: 'en' | 'es') {
  const res = await fetchFromWorker('/api/psyche/api/language', {
    method: 'PATCH',
    body: JSON.stringify({ language }),
  });
  return res.json();
}

export async function getMeta() {
  const res = await fetchFromWorker('/api/psyche/api/meta');
  return res.json();
}
