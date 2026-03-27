'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import VoiceOrb from './VoiceOrb';
import TranscriptView from './TranscriptView';
import { useSessionStore, usePartsStore, useAppStore } from '@/lib/store';
import { buildSystemPrompt, buildAdditionalVoices } from '@/lib/elevenlabs';
import { getArchetypeVoice } from '@/lib/voices';
import { t } from '@/lib/i18n';

interface SessionViewProps {
  partId: string;
  onEnd: () => void;
}

function SessionViewInner({ partId, onEnd }: SessionViewProps) {
  const { transcript, addTranscriptEntry, clearTranscript, setInSession } =
    useSessionStore();
  const { parts } = usePartsStore();
  const { language } = useAppStore();

  const activePart = useMemo(
    () => parts.find((p) => p.id === partId),
    [parts, partId]
  );

  const partVoice = activePart
    ? getArchetypeVoice(activePart.archetype)
    : null;

  const conversation = useConversation({
    onConnect: () => {
      console.log('[Parts] Connected to ElevenLabs agent');
    },
    onDisconnect: () => {
      console.log('[Parts] Disconnected from ElevenLabs agent');
    },
    onMessage: (message) => {
      if (message.source === 'ai') {
        addTranscriptEntry({
          speaker: 'facilitator',
          text: typeof message.message === 'string' ? message.message : '',
          timestamp: new Date().toISOString(),
        });
      }
    },
    onError: (error) => {
      console.error('[Parts] ElevenLabs error:', error);
    },
  });

  const { status, isSpeaking, isMuted, setMuted, endSession, startSession } =
    conversation;

  // Start the session on mount
  useEffect(() => {
    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_FACILITATOR_AGENT_ID;
    if (!agentId) {
      console.error('[Parts] Missing NEXT_PUBLIC_ELEVENLABS_FACILITATOR_AGENT_ID');
      return;
    }

    clearTranscript();
    setInSession(true);

    startSession({
      agentId,
    });

    return () => {
      setInSession(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEndSession = useCallback(() => {
    endSession();
    setInSession(false);
    onEnd();
  }, [endSession, setInSession, onEnd]);

  const handleToggleMute = useCallback(() => {
    setMuted(!isMuted);
  }, [setMuted, isMuted]);

  // Determine current speaker name for the orb
  const speakerName = isSpeaking
    ? activePart?.name || t('speaking', language)
    : t('listening', language);

  // Determine orb color based on part archetype
  const orbColor = partVoice
    ? getArchetypeColor(activePart?.archetype || '')
    : '#a855f7';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex bg-black/95"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Main session area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Status indicator */}
        <div className="absolute top-6 left-6">
          <StatusBadge status={status} />
        </div>

        {/* Session title */}
        <motion.h2
          className="text-lg font-light text-white/60 mb-12"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {t('sessionWith', language)}{' '}
          <span className="text-white/90 font-medium">
            {activePart?.name || 'Unknown Part'}
          </span>
        </motion.h2>

        {/* Voice orb */}
        <VoiceOrb
          isSpeaking={isSpeaking}
          speakerName={speakerName}
          color={orbColor}
        />

        {/* Controls */}
        <motion.div
          className="flex items-center gap-4 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Mute/unmute toggle */}
          <button
            onClick={handleToggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isMuted
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? (
              <MicOffIcon />
            ) : (
              <MicIcon />
            )}
          </button>

          {/* End session */}
          <button
            onClick={handleEndSession}
            className="px-6 py-3 rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors text-sm font-medium"
          >
            {t('endSession', language)}
          </button>
        </motion.div>
      </div>

      {/* Transcript sidebar */}
      <motion.div
        className="w-80 border-l border-white/10 p-4 flex flex-col"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">
          Transcript
        </h3>
        <TranscriptView entries={transcript} />
      </motion.div>
    </motion.div>
  );
}

// Wrap with ConversationProvider
export default function SessionView(props: SessionViewProps) {
  return (
    <ConversationProvider>
      <AnimatePresence>
        <SessionViewInner {...props} />
      </AnimatePresence>
    </ConversationProvider>
  );
}

// ── Helper components ─────────────────────────────────────

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
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-white/50">{label}</span>
    </div>
  );
}

function MicIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function getArchetypeColor(archetype: string): string {
  const colors: Record<string, string> = {
    critic: '#ef4444',       // red
    perfectionist: '#f97316', // orange
    inner_child: '#60a5fa',  // soft blue
    protector: '#22c55e',    // green
    pleaser: '#f59e0b',      // amber
    exile: '#8b5cf6',        // violet
  };
  const key = archetype.toLowerCase().replace(/\s+/g, '_');
  return colors[key] || '#a855f7';
}
