'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import VoiceOrb from './VoiceOrb';

const VOICES = [
  { id: 'observer',       name: 'Eder',     role: 'The Observer',     color: '#f59e0b' },
  { id: 'challenger',     name: 'Mario',    role: 'The Challenger',   color: '#ef4444' },
  { id: 'compassionate',  name: 'Victoria', role: 'The Compassionate',color: '#34d399' },
];

// Phrases that signal the AI is done — used as fallback if tool doesn't fire
const CLOSING_PATTERNS = /let that sit|see you next time|until next time|take care|goodbye|good bye|nos vemos|cuídate|closing.*session|end.*session/i;

interface SessionViewProps {
  partId: string;
  voiceIndex: number;
  previousAnswers: string[];
  onEnd: (transcript?: string) => void;
}

function SessionViewInner({ partId, voiceIndex, previousAnswers, onEnd }: SessionViewProps) {
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [lastUserMessage, setLastUserMessage]   = useState('');
  const [lastAiMessage, setLastAiMessage]       = useState('');
  const [doSessionId, setDoSessionId]           = useState<string | null>(null);
  const transcriptRef = useRef<Array<{ speaker: 'user' | 'ai'; text: string; timestamp: string }>>([]);
  const startTimeRef  = useRef(Date.now());
  const closingDetectedRef = useRef(false);
  const voice = VOICES[voiceIndex] || VOICES[0];

  const conversation = useConversation({
    onConnect: () => {
      setSessionReady(true);
      startTimeRef.current = Date.now();
    },
    onDisconnect: () => {
      setSessionReady(false);
      setSessionEnded(true);
    },
    onMessage: (message: any) => {
      const text = typeof message.message === 'string' ? message.message : '';
      if (!text.trim()) return;
      if (message.source === 'ai') {
        setLastAiMessage(text.trim());
        transcriptRef.current.push({ speaker: 'ai', text: text.trim(), timestamp: new Date().toISOString() });
        // Fallback: detect closing phrases in case tool doesn't fire
        if (CLOSING_PATTERNS.test(text)) {
          closingDetectedRef.current = true;
        }
      } else if (message.source === 'user') {
        setLastUserMessage(text.trim());
        transcriptRef.current.push({ speaker: 'user', text: text.trim(), timestamp: new Date().toISOString() });
      }
    },
    onUnhandledClientToolCall: (params: any) => {
      // Tool was called but not matched — end anyway
      console.warn('[Parts] Unhandled client tool call:', params);
      if (params?.tool_name === 'end_session' || params?.name === 'end_session') {
        setSessionEnded(true);
      }
    },
    onError: (error: any) => console.error('[Parts] ElevenLabs error:', error),
  });

  const { status, isSpeaking } = conversation;

  // ── Start session ────────────────────────────────────────
  useEffect(() => {
    const start = async () => {
      try {
        const res = await fetch('/api/session/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voiceIndex, previousAnswers }),
        });
        const data = await res.json();

        // Create DO session record
        try {
          const doRes = await fetch('/api/session/do-start', { method: 'POST' });
          if (doRes.ok) {
            const doData = await doRes.json();
            if (doData?.sessionId) setDoSessionId(doData.sessionId);
          }
        } catch { /* non-critical */ }

        // Register end_session client tool
        const clientTools = {
          end_session: () => {
            setSessionEnded(true);
            return 'ok';
          },
        };

        if (data.signedUrl) {
          const startOpts: any = { signedUrl: data.signedUrl, clientTools };
          if (data.systemPrompt) {
            startOpts.overrides = {
              agent: { prompt: { prompt: data.systemPrompt } },
            };
          }
          await conversation.startSession(startOpts);
        } else if (data.agentId) {
          await conversation.startSession({ agentId: data.agentId, clientTools });
        }
      } catch (err) {
        console.error('[Parts] Failed to start session:', err);
      }
    };
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hard cap at 120s — absolute safety net
  useEffect(() => {
    const timer = setTimeout(() => setSessionEnded(true), 120_000);
    return () => clearTimeout(timer);
  }, []);

  // Fallback: when AI stops speaking after saying goodbye, end the session
  // This catches the case where the tool doesn't fire but the AI said its closing line
  useEffect(() => {
    if (!isSpeaking && closingDetectedRef.current && !sessionEnded) {
      // Small delay to let the tool call arrive first (if it's coming)
      const timer = setTimeout(() => {
        if (closingDetectedRef.current) {
          setSessionEnded(true);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, sessionEnded]);

  // ── Session ended — cleanup & notify parent ──────────────
  useEffect(() => {
    if (!sessionEnded) return;

    // Disconnect ElevenLabs if still connected
    if (sessionReady) {
      try { conversation.endSession(); } catch {}
    }

    // Build summary from first user answer
    const firstUserTurn = transcriptRef.current.find((t) => t.speaker === 'user');
    const summary = firstUserTurn
      ? firstUserTurn.text.slice(0, 120) + (firstUserTurn.text.length > 120 ? '...' : '')
      : undefined;

    // Save to DO in background
    if (doSessionId) {
      fetch('/api/session/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: doSessionId,
          transcript: transcriptRef.current,
          summary,
        }),
      }).catch(() => {});
    }

    onEnd(lastUserMessage || summary || 'Session completed');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionEnded]);

  // ── Manual end (button) ──────────────────────────────────
  const handleManualEnd = useCallback(() => {
    setSessionEnded(true);
  }, []);

  const speakerName = isSpeaking ? voice.name : 'Listening...';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080f0b] p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Status indicator */}
      <motion.div
        className="absolute top-6 left-6 flex items-center gap-3"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor:
              status === 'connected'  ? '#22c55e' :
              status === 'connecting' ? '#f59e0b' : '#ef4444',
          }}
        />
        <span className="text-xs text-white/30">
          {status === 'connecting' ? 'Connecting...' : voice.role}
        </span>
      </motion.div>

      {/* Voice identity */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-xs text-white/15 uppercase tracking-wider">{voice.role}</span>
        <h2 className="text-lg font-medium text-white/50">{voice.name}</h2>
      </motion.div>

      {/* Orb */}
      <VoiceOrb isSpeaking={isSpeaking} speakerName={speakerName} color={voice.color} />

      {/* Last AI message */}
      {lastAiMessage && (
        <motion.p
          className="mt-8 text-sm text-white/25 max-w-sm text-center leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={lastAiMessage.slice(0, 20)}
        >
          &ldquo;{lastAiMessage}&rdquo;
        </motion.p>
      )}

      {/* End button */}
      <motion.div
        className="absolute bottom-10 flex items-center gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={handleManualEnd}
          className="px-6 py-3 rounded-full bg-white/[0.06] text-white/40
            hover:bg-white/[0.1] hover:text-white/60 transition-colors text-sm"
        >
          End
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function SessionView(props: SessionViewProps) {
  return (
    <ConversationProvider>
      <SessionViewInner {...props} />
    </ConversationProvider>
  );
}
