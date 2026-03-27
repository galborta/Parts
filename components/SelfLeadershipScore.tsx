'use client';

import { motion } from 'framer-motion';

interface SelfLeadershipScoreProps {
  score: number;
  sessionCount: number;
}

export default function SelfLeadershipScore({ score, sessionCount }: SelfLeadershipScoreProps) {
  return (
    <motion.div
      className="absolute bottom-6 left-6 glass rounded-xl p-4 z-30 glow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="text-[10px] uppercase tracking-wider text-white/15 mb-1.5">
        Self-Leadership
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-bold text-white/80">{score}</span>
        <span className="text-xs text-white/15 mb-1">/ 100</span>
      </div>
      <div className="w-28 h-1 bg-white/[0.04] rounded-full mt-2.5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.6), rgba(99,102,241,0.6))' }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(score, 2)}%` }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
      </div>
      <div className="text-[10px] text-white/10 mt-2">
        {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'}
      </div>
    </motion.div>
  );
}
