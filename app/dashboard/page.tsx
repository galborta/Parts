'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingFlow from '@/components/OnboardingFlow';
import PartDetailPanel from '@/components/PartDetailPanel';
import SelfLeadershipScore from '@/components/SelfLeadershipScore';
import SessionView from '@/components/SessionView';
import { useAppStore, usePartsStore, useInsightsStore } from '@/lib/store';
import { initUserPsyche, getMeta, getParts } from '@/lib/cloudflare';
import { t } from '@/lib/i18n';

const PartsMap3D = dynamic(
  () => import('@/components/three/PartsMap3D'),
  { ssr: false }
);

export default function DashboardPage() {
  const { data: session } = useSession();
  const { meta, setMeta, isOnboarded, setOnboarded, language } = useAppStore();
  const { parts, setParts, selectedPartId, selectPart } = usePartsStore();
  const { selfLeadershipScore } = useInsightsStore();
  const [loading, setLoading] = useState(true);
  const [showSession, setShowSession] = useState(false);
  const [sessionPartId, setSessionPartId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.email) return;

    const init = async () => {
      try {
        await initUserPsyche(session.user!.email!);
        const [metaResult, partsResult] = await Promise.all([getMeta(), getParts()]);
        if (metaResult.meta) setMeta(metaResult.meta);
        if (partsResult.parts) setParts(partsResult.parts);
      } catch (error) {
        console.error('Failed to initialize:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [session, setMeta, setParts]);

  const handlePartClick = useCallback((id: string) => {
    selectPart(id);
  }, [selectPart]);

  const handleStartSession = useCallback(() => {
    if (selectedPartId) {
      setSessionPartId(selectedPartId);
      setShowSession(true);
      selectPart(null);
    }
  }, [selectedPartId, selectPart]);

  const handleEndSession = useCallback(() => {
    setShowSession(false);
    setSessionPartId(null);
    getParts().then(r => { if (r.parts) setParts(r.parts); }).catch(() => {});
  }, [setParts]);

  const handleClosePanel = useCallback(() => {
    selectPart(null);
  }, [selectPart]);

  const handleOnboardingComplete = () => {
    setOnboarded(true);
    getParts().then(r => { if (r.parts) setParts(r.parts); }).catch(() => {});
  };

  const selectedPart = parts.find(p => p.id === selectedPartId) || null;
  const totalSessions = parts.reduce((sum, p) => sum + p.sessionCount, 0);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#08080f] flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-12 h-12 rounded-full border-2 border-violet-500/30 border-t-violet-400"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
          <span className="text-xs text-white/20">Loading your psyche...</span>
        </motion.div>
      </div>
    );
  }

  if (!isOnboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen w-full bg-[#08080f] relative overflow-hidden">
      {/* Header */}
      <motion.header
        className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/80 to-indigo-600/80 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
              <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.9" />
              <circle cx="12" cy="4" r="2" fill="currentColor" opacity="0.5" />
              <circle cx="20" cy="12" r="2" fill="currentColor" opacity="0.5" />
              <circle cx="12" cy="20" r="2" fill="currentColor" opacity="0.5" />
              <circle cx="4" cy="12" r="2" fill="currentColor" opacity="0.5" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white/60">Parts</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-white/15 hidden sm:block">{session?.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-xs text-white/20 hover:text-white/50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </motion.header>

      {/* 3D Parts Map */}
      <div className="absolute inset-0">
        <PartsMap3D
          parts={parts}
          selfLeadershipScore={selfLeadershipScore}
          onPartClick={handlePartClick}
        />
      </div>

      {/* Score */}
      <SelfLeadershipScore score={selfLeadershipScore} sessionCount={totalSessions} />

      {/* Parts count */}
      <motion.div
        className="absolute bottom-6 right-6 z-30"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="glass rounded-xl px-5 py-3 text-center glow-sm">
          <div className="text-xl font-bold text-white/80">{parts.length}</div>
          <div className="text-[10px] text-white/20 uppercase tracking-wider">{t('yourParts', language)}</div>
        </div>
      </motion.div>

      {/* Hint text for empty state */}
      {parts.length > 0 && !selectedPartId && !showSession && (
        <motion.div
          className="absolute top-20 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <p className="text-xs text-white/15">Click a part to begin a session</p>
        </motion.div>
      )}

      {/* Part Detail Panel */}
      <AnimatePresence>
        {selectedPart && !showSession && (
          <PartDetailPanel
            part={selectedPart}
            language={language}
            onStartSession={handleStartSession}
            onClose={handleClosePanel}
          />
        )}
      </AnimatePresence>

      {/* Voice Session Overlay */}
      <AnimatePresence>
        {showSession && sessionPartId && (
          <SessionView
            partId={sessionPartId}
            onEnd={handleEndSession}
          />
        )}
      </AnimatePresence>

      {/* Disclaimer */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20">
        <p className="text-[9px] text-white/[0.08]">
          {t('disclaimer', language)}
        </p>
      </div>
    </div>
  );
}
