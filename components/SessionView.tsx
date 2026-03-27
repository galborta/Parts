'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import VoiceOrb from './VoiceOrb';

const VOICES = [
  { id: 'observer', name: 'Eder', role: 'The Observer', color: '#f59e0b' },
  { id: 'challenger', name: 'Mario', role: 'The Challenger', color: '#ef4444' },
  { id: 'compassionate', name: 'Victoria', role: 'The Compassionate', color: '#34d399' },
];

interface SessionViewProps {
  partId: string;
  voiceIndex: number;
  previousAnswers: string[];
  onEnd: (transcript?: string) => void;
}

function SessionViewInner({ partId, voiceIndex, previousAnswers, onEnd }: SessionViewProps) {
  const [sessionReady, setSessionReady] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState('');
  const [lastAiMessage, setLastAiMessage] = useState('');
  const startTimeRef = useRef(Date.now());
  const voice = VOICES[voiceIndex] || VOICES[0];

  const conversation = useConversation({
    onConnect: () => {
      setSessionReady(true);
      startTimeRef.current = Date.now();
    },
    onDisconnect: () => {
      setSessionReady(false);
    },
    onMessage: (message: any) => {
      const text = typeof message.message === 'string' ? message.message : '';
      if (message.source === 'ai' && text.trim()) {
        setLastAiMessage(text.trim());
      } else if (message.source === 'user' && text.trim()) {
        setLastUserMessage(text.trim());
      }
    },
    onError: (error: any) => {
      console.error('[Parts] ElevenLabs error:', error);
    },
  });

  const { status, isSpeaking } = conversation;

  // Start session
  useEffect(() => {
    const startConversation = async () => {
      try {
        const res = await fetch('/api/session/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voiceIndex, previousAnswers }),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-end after 90 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleEndSession();
    }, 90000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEndSession = useCallback(() => {
    if (sessionReady) {
      try { conversation.endSession(); } catch {}
    }
    onEnd(lastUserMessage || 'Session completed');
  }, [conversation, sessionReady, onEnd, lastUserMessage]);

  const speakerName = isSpeaking ? voice.name : 'Listening...';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080f0b] p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Voice identity */}
      <motion.div
        className="absolute top-6 left-6 flex items-center gap-3"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: status === 'connected' ? '#22c55e' : status === 'connecting' ? '#f59e0b' : '#ef4444' }}
        />
        <span className="text-xs text-white/30">{status === 'connecting' ? 'Connecting...' : voice.role}</span>
      </motion.div>

      {/* Voice name */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-xs text-white/15 uppercase tracking-wider">{voice.role}</span>
        <h2 className="text-lg font-medium text-white/50">{voice.name}</h2>
      </motion.div>

      {/* Voice orb */}
      <VoiceOrb
        isSpeaking={isSpeaking}
        speakerName={speakerName}
        color={voice.color}
      />

      {/* Last AI message as subtitle */}
      {lastAiMessage && (
        <motion.p
          className="mt-8 text-sm text-white/25 max-w-sm text-center leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={lastAiMessage.slice(0, 20)}
        >
          "{lastAiMessage}"
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
          onClick={handleEndSession}
          className="px-6 py-3 rounded-full bg-white/[0.06] text-white/40 hover:bg-white/[0.1] hover:text-white/60 transition-colors text-sm"
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
