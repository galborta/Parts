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
  sessionCount: number;
  streak: number;
  lastSessionDate: string;
}

export type BurnoutDimension = 'exhaustion' | 'cynicism' | 'efficacy';

export interface BurnoutScores {
  exhaustion: number;   // 0-100, lower is better
  cynicism: number;     // 0-100, lower is better
  efficacy: number;     // 0-100, higher is better
}

// Recovery Index = ((100 - exhaustion) + (100 - cynicism) + efficacy) / 3
export type RecoveryPhase = 1 | 2 | 3 | 4;

export interface Session {
  id: string;
  voiceId: string;           // 'energy' | 'meaning' | 'capability'
  startedAt: string;
  endedAt?: string;
  transcript: TranscriptEntry[];
  summary?: string;
  duration?: number;
  dimensionScored?: BurnoutDimension;
  dimensionScore?: number;
}

export interface SessionIndexEntry {
  id: string;
  startedAt: string;
  voiceId: string;
  duration?: number;
  summary?: string;
}

export interface TranscriptEntry {
  id?: string;
  timestamp: string;
  speaker: 'user' | 'ai';
  text: string;
}

export interface Insight {
  id: string;
  text: string;
  surfacedAt: string;
  sessionId: string;
  acknowledged: boolean;
}

export interface ScoreHistory {
  current: BurnoutScores;
  recoveryIndex: number;
  phase: RecoveryPhase;
  history: { date: string; recoveryIndex: number; scores: BurnoutScores }[];
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
// 'session:{id}'   → Session
// 'session_index'  → SessionIndexEntry[]
// 'insights'       → Insight[]
// 'score'          → ScoreHistory
