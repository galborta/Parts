'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import SessionView from '@/components/SessionView';
import { VOICES } from '@/lib/voices';

interface ProgressData {
  sessionCount: number;
  streak: number;
  lastSessionDate: string;
  todaySessionCount: number;
  todaySummaries: string[];
  recentHistory: Array<{ id: string; startedAt: string; summary?: string }>;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [showSession, setShowSession] = useState(false);
  const [showSignal, setShowSignal] = useState(false);
  const [progress, setProgress] = useState<ProgressData>({
    sessionCount: 0, streak: 0, lastSessionDate: '',
    todaySessionCount: 0, todaySummaries: [], recentHistory: [],
  });
  const [loading, setLoading] = useState(true);

  const questionsToday = progress.todaySessionCount;
  const allDone = questionsToday >= 3;

  // Recovery phase from total sessions
  const phase =
    progress.sessionCount < 9  ? 1 :
    progress.sessionCount < 24 ? 2 :
    progress.sessionCount < 45 ? 3 : 4;
  const phaseNames = ['', 'Recognition', 'Mapping', 'Recovery', 'Resilience'];

  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch('/api/progress');
      if (res.ok) {
        const data: ProgressData = await res.json();
        setProgress(data);
      }
    } catch (err) {
      console.error('[Baseline] Failed to fetch progress:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  const handleStartSession = useCallback(() => {
    if (allDone) return;
    setShowSession(true);
  }, [allDone]);

  const handleEndSession = useCallback(async (transcript?: string) => {
    setShowSession(false);

    setProgress((prev) => ({
      ...prev,
      todaySessionCount: prev.todaySessionCount + 1,
      sessionCount: prev.sessionCount + 1,
      todaySummaries: [...prev.todaySummaries, transcript || 'Session completed'],
    }));

    if (questionsToday + 1 >= 3) {
      setShowSignal(true);
    }

    setTimeout(() => fetchProgress(), 2000);
  }, [questionsToday, fetchProgress]);

  const handleSignalSeen = useCallback(() => {
    setShowSignal(false);
  }, []);

  const progressInPhase = Math.min((progress.sessionCount % 9) / 9, 1);

  return (
    <div className="min-h-screen w-full bg-[#0f0c1a] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-violet-600/[0.04] rounded-full blur-[100px] animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-amber-600/[0.03] rounded-full blur-[100px] animate-float-delayed" />
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 flex items-center justify-between px-6 py-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/80 to-amber-500/80 flex items-center justify-center text-white text-xs font-bold">B</div>
          <span className="text-sm font-semibold text-white/60">Baseline</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/15 hidden sm:block">{session?.user?.email}</span>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="text-xs text-white/20 hover:text-white/40 transition-colors">
            Sign out
          </button>
        </div>
      </motion.header>

      {/* Main */}
      <div className="relative z-10 max-w-lg mx-auto px-6 pt-6 pb-20">
        {/* Greeting */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h1 className="text-2xl font-bold text-white mb-1">
            {getGreeting()}, {session?.user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-sm text-white/20">
            {allDone
              ? "All 3 sessions complete. Check your signal below."
              : loading ? 'Loading...' : `Session ${questionsToday + 1} of 3 is ready.`}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div className="grid grid-cols-3 gap-3 mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="glass rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-white/80">{progress.sessionCount}</div>
            <div className="text-[10px] text-white/20 uppercase tracking-wider">Sessions</div>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-white/80">{progress.streak}</div>
            <div className="text-[10px] text-white/20 uppercase tracking-wider">Streak</div>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-violet-400/80">{phaseNames[phase]}</div>
            <div className="text-[10px] text-white/20 uppercase tracking-wider">Phase {phase}</div>
          </div>
        </motion.div>

        {/* Phase bar */}
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.6), rgba(245,158,11,0.6))' }}
              initial={{ width: 0 }}
              animate={{ width: `${progressInPhase * 100}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </div>
        </motion.div>

        {/* Voice Cards */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xs uppercase tracking-wider text-white/20 mb-4">Today's Sessions</h2>
          <div className="space-y-3">
            {VOICES.map((voice, i) => {
              const isDone = i < questionsToday;
              const isCurrent = i === questionsToday && !allDone;
              const isLocked = i > questionsToday;

              return (
                <motion.div
                  key={voice.id}
                  className={`rounded-xl p-4 flex items-center gap-4 transition-all ${
                    isCurrent
                      ? 'glass border-violet-500/20 glow-sm cursor-pointer'
                      : isDone
                        ? 'glass opacity-60'
                        : 'glass opacity-30'
                  }`}
                  onClick={isCurrent ? handleStartSession : undefined}
                  whileHover={isCurrent ? { scale: 1.01 } : {}}
                  whileTap={isCurrent ? { scale: 0.99 } : {}}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-xl"
                    style={{
                      background: isDone || isCurrent
                        ? `radial-gradient(circle, ${voice.color}30, ${voice.color}10)`
                        : 'rgba(255,255,255,0.02)',
                    }}
                  >
                    {isDone ? '\u2713' : isLocked ? '\uD83D\uDD12' : voice.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isDone || isCurrent ? 'text-white/70' : 'text-white/20'}`}>
                        {voice.name}
                      </span>
                      <span className="text-[10px] text-white/15">{voice.role}</span>
                    </div>
                    {isDone && progress.todaySummaries[i] && (
                      <p className="text-xs text-white/20 mt-1 truncate">
                        {progress.todaySummaries[i]}
                      </p>
                    )}
                    {isCurrent && (
                      <p className="text-xs text-violet-400/50 mt-1">Tap to begin</p>
                    )}
                    {isLocked && (
                      <p className="text-xs text-white/10 mt-1">Complete the previous session first</p>
                    )}
                  </div>

                  {isCurrent && (
                    <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-violet-400">
                        <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Session History */}
        {progress.recentHistory.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h2 className="text-xs uppercase tracking-wider text-white/20 mb-3">Recent Sessions</h2>
            <div className="space-y-2">
              {progress.recentHistory.slice(-5).reverse().map((s, i) => (
                <div key={s.id || i} className="glass rounded-lg px-4 py-3">
                  <p className="text-[10px] text-white/10 mb-1">
                    {new Date(s.startedAt).toLocaleDateString()}
                  </p>
                  {s.summary && <p className="text-xs text-white/25">{s.summary}</p>}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <p className="text-[9px] text-white/[0.06] text-center mt-12">
          Baseline is a coaching tool, not a substitute for medical or mental health care.
        </p>
      </div>

      {/* Session */}
      <AnimatePresence>
        {showSession && (
          <SessionView
            partId="free"
            voiceIndex={questionsToday}
            previousAnswers={progress.todaySummaries}
            onEnd={handleEndSession}
          />
        )}
      </AnimatePresence>

      {/* The Signal — after all 3 sessions */}
      <AnimatePresence>
        {showSignal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0c1a] p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="max-w-md w-full text-center"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-amber-500/20 border border-violet-500/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">{'\uD83D\uDCE1'}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">The Signal</h2>
              <p className="text-sm text-white/25 mb-8">All 3 sessions complete. Here's what they reveal together.</p>

              <div className="rounded-xl p-6 mb-8 text-left glow-md" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(245,158,11,0.04))', border: '1px solid rgba(139,92,246,0.15)' }}>
                <p className="text-sm text-white/50 leading-relaxed">
                  {generateSignal(progress.todaySummaries)}
                </p>
              </div>

              <motion.button
                onClick={handleSignalSeen}
                className="btn-primary text-base w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Got it
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function generateSignal(summaries: string[]): string {
  if (summaries.length < 3) return 'Complete all 3 sessions to see your signal.';
  return `Today you checked in across all three dimensions. The Energy Audit surfaced where your capacity is going, the Meaning Finder probed what still drives you, and the Capability Mirror reflected what you're actually producing. This is how you track recovery — not by feeling better, but by seeing clearly.`;
}
