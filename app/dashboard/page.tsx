'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import OnboardingFlow from '@/components/OnboardingFlow';
import PartDetailPanel from '@/components/PartDetailPanel';
import SelfLeadershipScore from '@/components/SelfLeadershipScore';
import SessionView from '@/components/SessionView';
import { useAppStore, usePartsStore, useInsightsStore } from '@/lib/store';
import { initUserPsyche, getMeta, getParts } from '@/lib/cloudflare';
import { t } from '@/lib/i18n';

// Dynamic import for Three.js (avoid SSR issues)
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
    // Refresh parts data after session
    getParts().then(r => { if (r.parts) setParts(r.parts); }).catch(() => {});
  }, [setParts]);

  const handleClosePanel = useCallback(() => {
    selectPart(null);
  }, [selectPart]);

  const handleOnboardingComplete = () => {
    setOnboarded(true);
    // Refresh parts after onboarding
    getParts().then(r => { if (r.parts) setParts(r.parts); }).catch(() => {});
  };

  const selectedPart = parts.find(p => p.id === selectedPartId) || null;
  const totalSessions = parts.reduce((sum, p) => sum + p.sessionCount, 0);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0a0a1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isOnboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0a1a] relative overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-6">
        <h1 className="text-xl font-bold text-white/80">Parts</h1>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500">{session?.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-xs text-slate-500 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* 3D Parts Map — full viewport */}
      <div className="absolute inset-0">
        <PartsMap3D
          parts={parts}
          selfLeadershipScore={selfLeadershipScore}
          onPartClick={handlePartClick}
        />
      </div>

      {/* Self-Leadership Score */}
      <SelfLeadershipScore score={selfLeadershipScore} sessionCount={totalSessions} />

      {/* Part count indicator */}
      <div className="absolute bottom-6 right-6 z-30">
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl px-4 py-3 text-center">
          <div className="text-2xl font-bold text-white">{parts.length}</div>
          <div className="text-xs text-slate-400">{t('yourParts', language)}</div>
        </div>
      </div>

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
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20">
        <p className="text-[10px] text-slate-600">
          {t('disclaimer', language)}
        </p>
      </div>
    </div>
  );
}
