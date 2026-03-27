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

const ARCHETYPE_ICONS: Record<string, string> = {
  critic: '⚡',
  perfectionist: '🎯',
  inner_child: '🌱',
  protector: '🛡',
  pleaser: '🤝',
  exile: '🌙',
};

export default function PartDetailPanel({
  part,
  language,
  onStartSession,
  onClose,
}: PartDetailPanelProps) {
  const icon = ARCHETYPE_ICONS[part.archetype] || '✦';

  return (
    <motion.div
      className="fixed right-0 top-0 h-full w-[380px] bg-[#0c0c16]/95 backdrop-blur-2xl border-l border-white/[0.04] z-40 flex flex-col"
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 250 }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-white/20 hover:text-white/50 transition-colors rounded-lg hover:bg-white/[0.04]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="p-6 flex-1 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-white/[0.06] flex items-center justify-center mb-4">
            <span className="text-2xl">{icon}</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{part.name}</h2>
          <p className="text-sm text-white/20 capitalize mt-1">
            {part.archetype.replace(/_/g, ' ')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-bold text-white/80">{part.sessionCount}</div>
            <div className="text-[10px] text-white/20 uppercase tracking-wider mt-1">
              {part.sessionCount === 1 ? 'Session' : 'Sessions'}
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-bold text-white/80">
              {part.unburdened ? '✓' : '—'}
            </div>
            <div className="text-[10px] text-white/20 uppercase tracking-wider mt-1">Unburdened</div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5">
          {part.role && (
            <div>
              <h3 className="text-[10px] uppercase tracking-wider text-white/15 mb-1.5">Role</h3>
              <p className="text-sm text-white/40 leading-relaxed">{part.role}</p>
            </div>
          )}
          {part.fear && (
            <div>
              <h3 className="text-[10px] uppercase tracking-wider text-white/15 mb-1.5">Fear</h3>
              <p className="text-sm text-white/40 leading-relaxed">{part.fear}</p>
            </div>
          )}
          {part.description && (
            <div>
              <h3 className="text-[10px] uppercase tracking-wider text-white/15 mb-1.5">About</h3>
              <p className="text-sm text-white/40 leading-relaxed">{part.description}</p>
            </div>
          )}
          {part.lastSpokenTo && (
            <div>
              <h3 className="text-[10px] uppercase tracking-wider text-white/15 mb-1.5">Last Session</h3>
              <p className="text-sm text-white/30">
                {new Date(part.lastSpokenTo).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 border-t border-white/[0.04]">
        <motion.button
          onClick={onStartSession}
          className="w-full btn-primary text-base"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {t('startSession', language)}
        </motion.button>
      </div>
    </motion.div>
  );
}
