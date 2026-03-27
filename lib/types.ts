// ── Core Data Model ──────────────────────────────────────

export interface UserMeta {
  userId: string;
  email: string;
  language: 'en' | 'es';
  createdAt: string;
  onboarding: {
    completed: boolean;
    currentStep: number;
  };
}

export interface Part {
  id: string;
  name: string;
  archetype: string;
  voiceId: string;
  role: string;
  fear: string;
  protects: string[];           // IDs of parts this part protects
  description: string;
  personality: string;
  wounds: string[];
  gifts: string[];
  dialogueHistory: DialogueTurn[];
  discoveredAt: string;
  lastSpokenTo: string;
  sessionCount: number;
  unburdened: boolean;
}

export interface Session {
  id: string;
  primaryPartId: string;
  startedAt: string;
  endedAt?: string;
  transcript: TranscriptEntry[];
  insights: string[];
  selfLeadershipBefore: number;
  selfLeadershipAfter: number;
  summary?: string;
  duration?: number;
}

export interface SessionIndexEntry {
  id: string;
  startedAt: string;
  primaryPartId: string;
  duration?: number;
  summary?: string;
}

export interface TranscriptEntry {
  id: string;
  timestamp: string;
  speaker: 'user' | 'facilitator' | string;  // string = part name
  text: string;
  emotion?: string;
}

export interface DialogueTurn {
  speaker: 'user' | 'part' | 'facilitator';
  text: string;
  timestamp: string;
  emotion?: string;
}

export interface Insight {
  id: string;
  text: string;
  relatedPartIds: string[];
  surfacedAt: string;
  sessionId: string;
  acknowledged: boolean;
}

export interface ScoreHistory {
  current: number;
  history: { date: string; score: number }[];
}

// ── WebSocket Messages ───────────────────────────────────

export interface WebSocketMessage {
  type: 'init' | 'start_session' | 'send_message' | 'end_session' | 'get_insights' | 'update_language';
  payload: Record<string, unknown>;
}

export interface WebSocketResponse {
  type: 'session_started' | 'message_received' | 'session_ended' | 'insights' | 'error' | 'language_updated';
  data: Record<string, unknown>;
}

// ── DO Storage Keys ──────────────────────────────────────
// 'meta'           → UserMeta
// 'parts'          → Part[]
// 'session:{id}'   → Session
// 'session_index'  → SessionIndexEntry[]
// 'insights'       → Insight[]
// 'score'          → ScoreHistory
