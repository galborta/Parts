'use client';

import { motion } from 'framer-motion';

interface SelfLeadershipScoreProps {
  score: number;
  sessionCount: number;
}

export default function SelfLeadershipScore({ score, sessionCount }: SelfLeadershipScoreProps) {
  return (
    <motion.div
      className="absolute bottom-6 left-6 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 z-30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
        Self-Leadership
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-sm text-slate-400 mb-1">/ 100</span>
      </div>
      <div className="w-32 h-1.5 bg-slate-700 rounded-full mt-2">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: 0.7, duration: 0.8 }}
        />
      </div>
      <div className="text-xs text-slate-500 mt-2">
        {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'}
      </div>
    </motion.div>
  );
}
