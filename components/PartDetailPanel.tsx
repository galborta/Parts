'use client';

import { motion } from 'framer-motion';
import type { Part } from '@/lib/types';
import { t, type Language } from '@/lib/i18n';

interface PartDetailPanelProps {
  part: Part;
  language: Language;
  onStartSession: () => void;
  onClose: () => void;
}

export default function PartDetailPanel({
  part,
  language,
  onStartSession,
  onClose,
}: PartDetailPanelProps) {
  return (
    <motion.div
      className="fixed right-0 top-0 h-full w-96 bg-slate-900/95 border-l border-slate-700/50 backdrop-blur-xl z-40 p-6 flex flex-col"
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Part name and archetype */}
      <h2 className="text-2xl font-bold text-white mb-1">{part.name}</h2>
      <p className="text-sm text-slate-400 capitalize mb-6">
        {part.archetype.replace(/_/g, ' ')}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-2xl font-bold text-white">{part.sessionCount}</div>
          <div className="text-xs text-slate-400">
            {part.sessionCount === 1 ? 'Session' : 'Sessions'}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-2xl font-bold text-white">
            {part.unburdened ? '✓' : '—'}
          </div>
          <div className="text-xs text-slate-400">Unburdened</div>
        </div>
      </div>

      {/* Role and Fear */}
      {part.role && (
        <div className="mb-4">
          <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-1">Role</h3>
          <p className="text-sm text-slate-300">{part.role}</p>
        </div>
      )}
      {part.fear && (
        <div className="mb-4">
          <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-1">Fear</h3>
          <p className="text-sm text-slate-300">{part.fear}</p>
        </div>
      )}

      {/* Description */}
      {part.description && (
        <div className="mb-4">
          <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-1">About</h3>
          <p className="text-sm text-slate-300">{part.description}</p>
        </div>
      )}

      {/* Last spoken */}
      {part.lastSpokenTo && (
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-1">Last Session</h3>
          <p className="text-sm text-slate-400">
            {new Date(part.lastSpokenTo).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Start Session button */}
      <motion.button
        onClick={onStartSession}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-purple-500 hover:to-blue-500 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {t('startSession', language)}
      </motion.button>
    </motion.div>
  );
}
