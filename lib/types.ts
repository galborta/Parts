export interface UserPsyche {
  userId: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  parts: Part[];
  sessions: Session[];
  insights: Insight[];
  systemState: string;
}

export interface Part {
  id: string;
  name: string;
  archetype: string;
  voiceId: string;
  description: string;
  personality: string;
  wounds: string[];
  gifts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  partIds: string[];
  startedAt: string;
  endedAt?: string;
  transcript: TranscriptEntry[];
  summary?: string;
  keyInsights: Insight[];
  duration?: number;
  emotion?: string;
}

export interface TranscriptEntry {
  id: string;
  timestamp: string;
  speaker: string;
  speakerId: string;
  text: string;
  audioUrl?: string;
  emotion?: string;
}

export interface DialogueTurn {
  userText: string;
  partResponse: string;
  partId: string;
  timestamp: string;
}

export interface Insight {
  id: string;
  userId: string;
  sessionId?: string;
  content: string;
  category: string;
  timestamp: string;
  embedding?: number[];
  relatedParts: string[];
}

export interface WebSocketMessage {
  type: 'init' | 'start_session' | 'send_message' | 'end_session' | 'get_insights';
  payload: Record<string, unknown>;
}

export interface WebSocketResponse {
  type: 'session_started' | 'message_received' | 'session_ended' | 'insights' | 'error';
  data: Record<string, unknown>;
}
