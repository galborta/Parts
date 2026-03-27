'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import SessionView from '@/components/SessionView';

const VOICES = [
  { id: 'observer', name: 'Eder', role: 'The Observer', color: '#f59e0b', icon: '👁' },
  { id: 'challenger', name: 'Mario', role: 'The Challenger', color: '#ef4444', icon: '⚡' },
  { id: 'compassionate', name: 'Victoria', role: 'The Compassionate', color: '#34d399', icon: '💚' },
];

interface DayProgress {
  date: string;
  answers: string[];
  consejo?: string;
}

interface UserProgress {
  totalDays: number;
  streak: number;
  currentDay: DayProgress;
  history: DayProgress[];
  lastDate: string;
}

function getDefaultProgress(): UserProgress {
  return {
    totalDays: 0,
    streak: 0,
    currentDay: { date: new Date().toDateString(), answers: [] },
    history: [],
    lastDate: '',
  };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [showSession, setShowSession] = useState(false);
  const [showConsejo, setShowConsejo] = useState(false);
  const [progress, setProgress] = useState<UserProgress>(getDefaultProgress());

  const today = new Date().toDateString();
  const questionsToday = progress.currentDay.date === today ? progress.currentDay.answers.length : 0;
  const currentVoice = VOICES[questionsToday] || VOICES[0];
  const allDone = questionsToday >= 3;
  const consejoReady = allDone && !progress.currentDay.consejo;

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem('parts_progress_v2');
    if (saved) {
      const data: UserProgress = JSON.parse(saved);
      if (data.currentDay.date !== today) {
        // New day
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const newStreak = data.lastDate === yesterday.toDateString() ? data.streak + 1 : (data.lastDate === today ? data.streak : 0);
        const history = data.currentDay.answers.length > 0
          ? [data.currentDay, ...data.history].slice(0, 30)
          : data.history;
        setProgress({
          ...data,
          streak: newStreak,
          currentDay: { date: today, answers: [] },
          history,
        });
      } else {
        setProgress(data);
      }
    }
  }, [today]);

  const saveProgress = useCallback((updated: UserProgress) => {
    setProgress(updated);
    localStorage.setItem('parts_progress_v2', JSON.stringify(updated));
  }, []);

  const handleStartSession = useCallback(() => {
    if (allDone) return;
    setShowSession(true);
  }, [allDone]);

  const handleEndSession = useCallback((transcript?: string) => {
    setShowSession(false);
    const answer = transcript || 'Session completed';
    const updatedDay = {
      ...progress.currentDay,
      date: today,
      answers: [...progress.currentDay.answers, answer],
    };
    const updated: UserProgress = {
      ...progress,
      currentDay: updatedDay,
      totalDays: progress.currentDay.answers.length === 0 ? progress.totalDays + 1 : progress.totalDays,
      lastDate: today,
    };

    // If this was the 3rd question, show consejo
    if (updatedDay.answers.length >= 3) {
      setShowConsejo(true);
    }

    saveProgress(updated);
  }, [progress, today, saveProgress]);

  const handleConsejoSeen = useCallback(() => {
    const consejo = generateConsejo(progress.currentDay.answers);
    const updated = {
      ...progress,
      currentDay: { ...progress.currentDay, consejo },
    };
    saveProgress(updated);
    setShowConsejo(false);
  }, [progress, saveProgress]);

  const level = Math.floor(progress.totalDays / 3) + 1;
  const progressInLevel = (progress.totalDays % 3) / 3;

  return (
    <div className="min-h-screen w-full bg-[#080f0b] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-emerald-600/[0.04] rounded-full blur-[100px] animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-teal-600/[0.03] rounded-full blur-[100px] animate-float-delayed" />
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 flex items-center justify-between px-6 py-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/80 to-teal-600/80 flex items-center justify-center text-white text-xs font-bold">P</div>
          <span className="text-sm font-semibold text-white/60">Parts</span>
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
              ? progress.currentDay.consejo ? "Today's complete. See your consejo below." : "All 3 voices have spoken."
              : `Voice ${questionsToday + 1} of 3 is ready.`}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div className="grid grid-cols-3 gap-3 mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="glass rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-white/80">{progress.totalDays}</div>
            <div className="text-[10px] text-white/20 uppercase tracking-wider">Days</div>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-white/80">{progress.streak}</div>
            <div className="text-[10px] text-white/20 uppercase tracking-wider">Streak</div>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-emerald-400/80">Lv {level}</div>
            <div className="text-[10px] text-white/20 uppercase tracking-wider">Depth</div>
          </div>
        </motion.div>

        {/* Level bar */}
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, rgba(52,211,153,0.6), rgba(16,185,129,0.6))' }}
              initial={{ width: 0 }}
              animate={{ width: `${progressInLevel * 100}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </div>
        </motion.div>

        {/* Voice Cards — today's 3 questions */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xs uppercase tracking-wider text-white/20 mb-4">Today's Voices</h2>
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
                      ? 'glass border-emerald-500/20 glow-sm cursor-pointer'
                      : isDone
                        ? 'glass opacity-60'
                        : 'glass opacity-30'
                  }`}
                  onClick={isCurrent ? handleStartSession : undefined}
                  whileHover={isCurrent ? { scale: 1.01 } : {}}
                  whileTap={isCurrent ? { scale: 0.99 } : {}}
                >
                  {/* Voice avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-xl"
                    style={{
                      background: isDone || isCurrent
                        ? `radial-gradient(circle, ${voice.color}30, ${voice.color}10)`
                        : 'rgba(255,255,255,0.02)',
                    }}
                  >
                    {isDone ? '✓' : isLocked ? '🔒' : voice.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isDone || isCurrent ? 'text-white/70' : 'text-white/20'}`}>
                        {voice.name}
                      </span>
                      <span className="text-[10px] text-white/15">{voice.role}</span>
                    </div>
                    {isDone && progress.currentDay.answers[i] && (
                      <p className="text-xs text-white/20 mt-1 truncate">
                        {progress.currentDay.answers[i]}
                      </p>
                    )}
                    {isCurrent && (
                      <p className="text-xs text-emerald-400/50 mt-1">Tap to begin</p>
                    )}
                    {isLocked && (
                      <p className="text-xs text-white/10 mt-1">Answer the previous question first</p>
                    )}
                  </div>

                  {isCurrent && (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
                        <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* El Consejo — unlocked after 3 questions */}
        {progress.currentDay.consejo && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xs uppercase tracking-wider text-white/20 mb-3">Today's Consejo</h2>
            <div className="rounded-xl p-5 glow-md" style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(16,185,129,0.04))' , border: '1px solid rgba(52,211,153,0.15)' }}>
              <p className="text-sm text-white/50 leading-relaxed">{progress.currentDay.consejo}</p>
            </div>
          </motion.div>
        )}

        {/* History */}
        {progress.history.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h2 className="text-xs uppercase tracking-wider text-white/20 mb-3">Past Consejos</h2>
            <div className="space-y-2">
              {progress.history.filter(d => d.consejo).slice(0, 5).map((day, i) => (
                <div key={i} className="glass rounded-lg px-4 py-3">
                  <p className="text-[10px] text-white/10 mb-1">{day.date}</p>
                  <p className="text-xs text-white/25">{day.consejo}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <p className="text-[9px] text-white/[0.06] text-center mt-12">
          Parts is not therapy and is not a replacement for professional mental health care.
        </p>
      </div>

      {/* Session */}
      <AnimatePresence>
        {showSession && (
          <SessionView
            partId="free"
            voiceIndex={questionsToday}
            previousAnswers={progress.currentDay.answers}
            onEnd={handleEndSession}
          />
        )}
      </AnimatePresence>

      {/* Consejo Reveal */}
      <AnimatePresence>
        {showConsejo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#080f0b] p-6"
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🌿</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">El Consejo</h2>
              <p className="text-sm text-white/25 mb-8">All 3 voices have spoken. Here's what they see together.</p>

              <div className="rounded-xl p-6 mb-8 text-left glow-md" style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(16,185,129,0.04))', border: '1px solid rgba(52,211,153,0.15)' }}>
                <p className="text-sm text-white/50 leading-relaxed">
                  {generateConsejo(progress.currentDay.answers)}
                </p>
              </div>

              <motion.button
                onClick={handleConsejoSeen}
                className="btn-primary text-base w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                I hear you
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

function generateConsejo(answers: string[]): string {
  // In production, this would be an AI call. For now, a contextual template.
  if (answers.length < 3) return 'Complete all 3 questions to unlock your consejo.';
  return `Today you explored three layers of yourself. The Observer noticed what's present, the Challenger pushed you to look deeper, and the Compassionate helped you hold what you found with kindness. This is the work — not fixing, but understanding. You're building a relationship with yourself that most people never attempt.`;
}
