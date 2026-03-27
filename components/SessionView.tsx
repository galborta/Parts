'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import VoiceOrb from './VoiceOrb';
import TranscriptView from './TranscriptView';
import { useSessionStore, usePartsStore, useAppStore } from '@/lib/store';
import { getArchetypeVoice } from '@/lib/voices';
import { t } from '@/lib/i18n';

const SESSION_DURATION_SEC = 7 * 60; // 7 minutes max

interface SessionViewProps {
  partId: string;
  onEnd: () => void;
}

function getArchetypeColor(archetype: string): string {
  const colors: Record<string, string> = {
    critic: '#ef4444',
    perfectionist: '#f97316',
    inner_child: '#60a5fa',
    protector: '#22c55e',
    pleaser: '#f59e0b',
    exile: '#8b5cf6',
  };
  const key = archetype.toLowerCase().replace(/\s+/g, '_');
  return colors[key] || '#a855f7';
}

type SessionPhase = 'connecting' | 'active' | 'summary';

function SessionViewInner({ partId, onEnd }: SessionViewProps) {
  const { transcript, addTranscriptEntry, clearTranscript, setInSession } =
    useSessionStore();
  const { parts } = usePartsStore();
  const { language } = useAppStore();
  const [sessionReady, setSessionReady] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [phase, setPhase] = useState<SessionPhase>('connecting');
  const [elapsed, setElapsed] = useState(0);
  const [sessionInsight, setSessionInsight] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const activePart = useMemo(
    () => (partId === 'free' ? null : parts.find((p) => p.id === partId)),
    [parts, partId]
  );

  const conversation = useConversation({
    onConnect: () => {
      console.log('[Parts] Connected to ElevenLabs agent');
      setSessionReady(true);
      setPhase('active');
      startTimeRef.current = Date.now();
    },
    onDisconnect: () => {
      console.log('[Parts] Disconnected from ElevenLabs agent');
      setSessionReady(false);
    },
    onMessage: (message: any) => {
      if (message.source === 'ai') {
        const text = typeof message.message === 'string' ? message.message : '';
        let speaker = language === 'es' ? 'Facilitador' : 'Facilitator';
        const voiceMatch = text.match(/<(\w+)>/);
        if (voiceMatch) {
          const label = voiceMatch[1];
          const labelMap: Record<string, string> = {
            InnerCritic: language === 'es' ? 'Crítico Interno' : 'Inner Critic',
            Perfectionist: language === 'es' ? 'Perfeccionista' : 'Perfectionist',
            InnerChild: language === 'es' ? 'Niño Interior' : 'Inner Child',
            Protector: language === 'es' ? 'Protector' : 'Protector',
            Pleaser: language === 'es' ? 'Complaciente' : 'Pleaser',
            Exile: language === 'es' ? 'Exiliado' : 'Exile',
          };
          speaker = labelMap[label] || label;
        }
        const cleanText = text.replace(/<\/?[\w]+>/g, '').trim();
        if (cleanText) {
          addTranscriptEntry({ speaker, text: cleanText, timestamp: new Date().toISOString() });
          // Check if this is the wrap-up message (agent signals end)
          if (cleanText.toLowerCase().includes('good place to pause') ||
              cleanText.toLowerCase().includes('buen momento para pausar') ||
              cleanText.toLowerCase().includes('session is complete') ||
              cleanText.toLowerCase().includes('made real progress')) {
            setSessionInsight(cleanText);
          }
        }
      } else if (message.source === 'user') {
        const text = typeof message.message === 'string' ? message.message : '';
        if (text.trim()) {
          addTranscriptEntry({ speaker: language === 'es' ? 'Tú' : 'You', text: text.trim(), timestamp: new Date().toISOString() });
        }
      }
    },
    onError: (error: any) => {
      console.error('[Parts] ElevenLabs error:', error);
    },
  });

  const { status, isSpeaking } = conversation;

  // Timer
  useEffect(() => {
    if (phase !== 'active') return;
    timerRef.current = setInterval(() => {
      const now = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsed(now);
      // Auto-end at max duration
      if (now >= SESSION_DURATION_SEC) {
        handleEndSession();
      }
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Start the session
  useEffect(() => {
    clearTranscript();
    setInSession(true);

    const startConversation = async () => {
      try {
        const res = await fetch('/api/session/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ primaryPartId: partId, language }),
        });
        const data = await res.json();

        if (data.signedUrl) {
          await conversation.startSession({ signedUrl: data.signedUrl });
        } else if (data.agentId) {
          await conversation.startSession({ agentId: data.agentId });
        }
      } catch (err) {
        console.error('[Parts] Failed to start session:', err);
      }
    };

    startConversation();
    return () => { setInSession(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEndSession = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (sessionReady) {
      try { conversation.endSession(); } catch {}
    }

    // Show summary screen
    setPhase('summary');
  }, [conversation, sessionReady]);

  const handleFinishAndSave = useCallback(async () => {
    // Save session to Worker
    try {
      await fetch('/api/session/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: crypto.randomUUID(),
          transcript: transcript.map(e => ({
            speaker: e.speaker,
            text: e.text,
            timestamp: e.timestamp,
          })),
          duration: elapsed,
          insight: sessionInsight,
        }),
      });
    } catch {
      // Continue even if save fails
    }

    setInSession(false);
    onEnd();
  }, [transcript, elapsed, sessionInsight, setInSession, onEnd]);

  const handleToggleMute = useCallback(() => {
    if (!sessionReady) return;
    try {
      const newMuted = !isMicMuted;
      setIsMicMuted(newMuted);
      conversation.setVolume({ volume: newMuted ? 0 : 1 });
    } catch {}
  }, [conversation, sessionReady, isMicMuted]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const sessionTitle = activePart
    ? `${t('sessionWith', language)} ${activePart.name}`
    : language === 'es' ? 'Sesión con tu Facilitador' : 'Session with your Facilitator';

  const orbColor = activePart
    ? getArchetypeColor(activePart.archetype)
    : '#a855f7';

  const speakerName = isSpeaking
    ? (activePart?.name || (language === 'es' ? 'Facilitador' : 'Facilitator'))
    : (language === 'es' ? 'Escuchando...' : 'Listening...');

  const timeRemaining = SESSION_DURATION_SEC - elapsed;
  const isAlmostDone = timeRemaining <= 60;

  // ── Summary Screen ─────────────────────────────────────
  if (phase === 'summary') {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#08080f] p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✦</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {language === 'es' ? 'Sesión Completa' : 'Session Complete'}
          </h2>
          <p className="text-white/30 mb-8">
            {formatTime(elapsed)} {language === 'es' ? 'minutos' : 'minutes'}
          </p>

          {/* Session insight */}
          {sessionInsight && (
            <div className="glass rounded-xl p-5 mb-8 text-left">
              <h3 className="text-[10px] uppercase tracking-wider text-white/20 mb-2">
                {language === 'es' ? 'Lo que descubrimos' : 'What we discovered'}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed">{sessionInsight}</p>
            </div>
          )}

          {/* Transcript summary */}
          <div className="glass rounded-xl p-5 mb-8 text-left">
            <h3 className="text-[10px] uppercase tracking-wider text-white/20 mb-2">
              {language === 'es' ? 'Resumen' : 'Summary'}
            </h3>
            <div className="flex items-center gap-4 text-sm text-white/30">
              <span>{transcript.length} {language === 'es' ? 'intercambios' : 'exchanges'}</span>
              <span className="text-white/10">|</span>
              <span>{new Set(transcript.map(e => e.speaker)).size} {language === 'es' ? 'voces' : 'voices'}</span>
            </div>
          </div>

          <motion.button
            onClick={handleFinishAndSave}
            className="btn-primary text-base w-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {language === 'es' ? 'Guardar y Continuar' : 'Save & Continue'}
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // ── Active Session Screen ──────────────────────────────
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col md:flex-row bg-[#08080f]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex-1 flex flex-col items-center justify-center relative p-4">
        {/* Status + Timer */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-4">
          <StatusBadge status={status} />
          {phase === 'active' && (
            <span className={`text-xs font-mono ${isAlmostDone ? 'text-amber-400/60' : 'text-white/20'}`}>
              {formatTime(elapsed)} / {formatTime(SESSION_DURATION_SEC)}
            </span>
          )}
        </div>

        {/* Session title */}
        <motion.h2
          className="text-base md:text-lg font-light text-white/40 mb-8 md:mb-12 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {sessionTitle}
        </motion.h2>

        {/* Voice orb */}
        <VoiceOrb
          isSpeaking={isSpeaking}
          speakerName={speakerName}
          color={orbColor}
        />

        {/* Time warning */}
        {isAlmostDone && phase === 'active' && (
          <motion.p
            className="mt-4 text-xs text-amber-400/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {language === 'es' ? 'La sesión terminará pronto' : 'Session ending soon'}
          </motion.p>
        )}

        {/* Controls */}
        <motion.div
          className="flex items-center gap-4 mt-8 md:mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={handleToggleMute}
            disabled={!sessionReady}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isMicMuted
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.1]'
            } disabled:opacity-30`}
          >
            {isMicMuted ? <MicOffIcon /> : <MicIcon />}
          </button>

          <button
            onClick={handleEndSession}
            className="px-6 py-3 rounded-full bg-white/[0.06] text-white/60 hover:bg-white/[0.1] transition-colors text-sm font-medium"
          >
            {t('endSession', language)}
          </button>
        </motion.div>

        {status === 'connecting' && (
          <motion.p className="mt-6 text-xs text-white/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {language === 'es' ? 'Conectando con tu facilitador...' : 'Connecting to your facilitator...'}
          </motion.p>
        )}
      </div>

      {/* Transcript sidebar */}
      <motion.div
        className="hidden md:flex w-80 border-l border-white/[0.04] p-4 flex-col bg-[#0a0a12]"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <h3 className="text-[10px] font-medium text-white/20 uppercase tracking-wider mb-3">
          Transcript
        </h3>
        <TranscriptView entries={transcript} />
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

// ── Helpers ──────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    disconnected: { label: 'Disconnected', color: '#ef4444' },
    connecting: { label: 'Connecting...', color: '#f59e0b' },
    connected: { label: 'Connected', color: '#22c55e' },
    error: { label: 'Error', color: '#ef4444' },
  };
  const { label, color } = config[status] || config.disconnected;

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
        animate={status === 'connecting' ? { opacity: [1, 0.3, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <span className="text-xs text-white/30">{label}</span>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
