'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import SessionView from '@/components/SessionView';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [showSession, setShowSession] = useState(false);
  const [questionsToday, setQuestionsToday] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [streak, setStreak] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);
  const [lastInsight, setLastInsight] = useState('');

  const MAX_DAILY = 3;
  const remaining = MAX_DAILY - questionsToday;

  // Load progress from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('parts_progress');
    if (saved) {
      const data = JSON.parse(saved);
      setTotalSessions(data.totalSessions || 0);
      setStreak(data.streak || 0);
      setInsights(data.insights || []);
      // Reset daily count if new day
      if (data.lastDate === today) {
        setQuestionsToday(data.questionsToday || 0);
      } else {
        setQuestionsToday(0);
        // Update streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (data.lastDate === yesterday.toDateString()) {
          setStreak((data.streak || 0) + 1);
        } else if (data.lastDate !== today) {
          setStreak(0);
        }
      }
    }
  }, []);

  const saveProgress = useCallback((newInsight?: string) => {
    const today = new Date().toDateString();
    const newTotal = totalSessions + 1;
    const newQToday = questionsToday + 1;
    const newInsights = newInsight ? [newInsight, ...insights].slice(0, 20) : insights;

    setTotalSessions(newTotal);
    setQuestionsToday(newQToday);
    setInsights(newInsights);
    if (newInsight) setLastInsight(newInsight);

    localStorage.setItem('parts_progress', JSON.stringify({
      totalSessions: newTotal,
      questionsToday: newQToday,
      streak,
      insights: newInsights,
      lastDate: today,
    }));
  }, [totalSessions, questionsToday, insights, streak]);

  const handleStartSession = useCallback(() => {
    if (remaining <= 0) return;
    setShowSession(true);
  }, [remaining]);

  const handleEndSession = useCallback(() => {
    setShowSession(false);
    saveProgress('You explored a new dimension of your inner world.');
  }, [saveProgress]);

  // Progress level based on total sessions
  const level = Math.floor(totalSessions / 5) + 1;
  const progressInLevel = (totalSessions % 5) / 5;

  return (
    <div className="min-h-screen w-full bg-[#080f0b] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-emerald-600/[0.04] rounded-full blur-[100px] animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-teal-600/[0.03] rounded-full blur-[100px] animate-float-delayed" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#080f0b_80%)]" />
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 flex items-center justify-between px-6 py-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/80 to-teal-600/80 flex items-center justify-center text-white text-xs font-bold">
            P
          </div>
          <span className="text-sm font-semibold text-white/60">Parts</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/15 hidden sm:block">{session?.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-xs text-white/20 hover:text-white/40 transition-colors"
          >
            Sign out
          </button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 max-w-lg mx-auto px-6 pt-8 pb-20">
        {/* Greeting */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-2xl font-bold text-white mb-1">
            {getGreeting()}, {session?.user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-sm text-white/20">
            {remaining > 0
              ? `You have ${remaining} question${remaining !== 1 ? 's' : ''} left today.`
              : "You've completed today's questions. Come back tomorrow."}
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-3 gap-3 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white/80">{totalSessions}</div>
            <div className="text-[10px] text-white/20 uppercase tracking-wider mt-1">Sessions</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white/80">{streak}</div>
            <div className="text-[10px] text-white/20 uppercase tracking-wider mt-1">Day Streak</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400/80">Lv {level}</div>
            <div className="text-[10px] text-white/20 uppercase tracking-wider mt-1">Awareness</div>
          </div>
        </motion.div>

        {/* Level Progress */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/20">Level {level}</span>
            <span className="text-xs text-white/20">Level {level + 1}</span>
          </div>
          <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, rgba(52,211,153,0.6), rgba(16,185,129,0.6))' }}
              initial={{ width: 0 }}
              animate={{ width: `${progressInLevel * 100}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </div>
          <p className="text-[10px] text-white/10 mt-1.5">
            {5 - (totalSessions % 5)} sessions to next level
          </p>
        </motion.div>

        {/* Daily Questions */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xs uppercase tracking-wider text-white/20 mb-4">Today's Questions</h2>
          <div className="flex gap-2 mb-6">
            {Array.from({ length: MAX_DAILY }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i < questionsToday ? 'bg-emerald-500/60' : 'bg-white/[0.06]'
                }`}
              />
            ))}
          </div>

          {remaining > 0 ? (
            <motion.button
              onClick={handleStartSession}
              className="w-full btn-primary text-base py-5 rounded-2xl flex items-center justify-center gap-3"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-70">
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
              {questionsToday === 0 ? 'Start Today\'s First Question' : 'Next Question'}
            </motion.button>
          ) : (
            <div className="glass rounded-2xl p-6 text-center">
              <span className="text-3xl block mb-3">✓</span>
              <p className="text-sm text-white/40">All done for today. Great work.</p>
              <p className="text-xs text-white/15 mt-1">Come back tomorrow for 3 new questions.</p>
            </div>
          )}
        </motion.div>

        {/* Last Insight */}
        {lastInsight && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xs uppercase tracking-wider text-white/20 mb-3">Latest Insight</h2>
            <div className="glass rounded-xl p-4 glow-sm">
              <p className="text-sm text-white/40 leading-relaxed">{lastInsight}</p>
            </div>
          </motion.div>
        )}

        {/* Recent Insights */}
        {insights.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xs uppercase tracking-wider text-white/20 mb-3">Your Journey</h2>
            <div className="space-y-2">
              {insights.slice(1, 6).map((insight, i) => (
                <div key={i} className="glass rounded-lg px-4 py-3">
                  <p className="text-xs text-white/25">{insight}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Disclaimer */}
        <p className="text-[9px] text-white/[0.06] text-center mt-12">
          Parts is not therapy and is not a replacement for professional mental health care.
        </p>
      </div>

      {/* Voice Session Overlay */}
      <AnimatePresence>
        {showSession && (
          <SessionView
            partId="free"
            onEnd={handleEndSession}
          />
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
