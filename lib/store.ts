import { create } from 'zustand';
import type { SessionIndexEntry, Insight, UserMeta } from './types';
import type { Language } from './i18n';

// ── App Store ────────────────────────────────────────────

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  meta: UserMeta | null;
  setMeta: (meta: UserMeta) => void;
  isOnboarded: boolean;
  setOnboarded: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  setLanguage: (language) => set({ language }),
  meta: null,
  setMeta: (meta) => set({ meta, language: meta.language, isOnboarded: meta.onboarding.completed }),
  isOnboarded: false,
  setOnboarded: (isOnboarded) => set({ isOnboarded }),
}));

// ── Session Store ────────────────────────────────────────

interface SessionState {
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  isInSession: boolean;
  setInSession: (v: boolean) => void;
  transcript: { speaker: string; text: string; timestamp: string }[];
  addTranscriptEntry: (entry: { speaker: string; text: string; timestamp: string }) => void;
  clearTranscript: () => void;
  sessionHistory: SessionIndexEntry[];
  setSessionHistory: (sessions: SessionIndexEntry[]) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  activeSessionId: null,
  setActiveSessionId: (activeSessionId) => set({ activeSessionId }),
  isInSession: false,
  setInSession: (isInSession) => set({ isInSession }),
  transcript: [],
  addTranscriptEntry: (entry) => set((state) => ({ transcript: [...state.transcript, entry] })),
  clearTranscript: () => set({ transcript: [] }),
  sessionHistory: [],
  setSessionHistory: (sessionHistory) => set({ sessionHistory }),
}));

// ── Insights Store ───────────────────────────────────────

interface InsightsState {
  insights: Insight[];
  setInsights: (insights: Insight[]) => void;
  recoveryIndex: number;
  setRecoveryIndex: (score: number) => void;
}

export const useInsightsStore = create<InsightsState>((set) => ({
  insights: [],
  setInsights: (insights) => set({ insights }),
  recoveryIndex: 0,
  setRecoveryIndex: (recoveryIndex) => set({ recoveryIndex }),
}));
