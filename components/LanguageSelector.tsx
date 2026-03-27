'use client';

import { motion } from 'framer-motion';
import type { Language } from '@/lib/i18n';

interface LanguageSelectorProps {
  onSelect: (lang: Language) => void;
}

export default function LanguageSelector({ onSelect }: LanguageSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-8"
    >
      <h2 className="text-3xl font-bold text-white">Choose your language</h2>
      <p className="text-slate-400">Elige tu idioma</p>

      <div className="flex gap-6">
        <motion.button
          onClick={() => onSelect('en')}
          className="px-12 py-6 bg-slate-800/50 border border-slate-700 rounded-2xl text-white text-xl font-medium hover:bg-slate-700/50 hover:border-purple-500/50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-4xl mb-2 block">🇺🇸</span>
          English
        </motion.button>

        <motion.button
          onClick={() => onSelect('es')}
          className="px-12 py-6 bg-slate-800/50 border border-slate-700 rounded-2xl text-white text-xl font-medium hover:bg-slate-700/50 hover:border-purple-500/50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-4xl mb-2 block">🇪🇸</span>
          Español
        </motion.button>
      </div>
    </motion.div>
  );
}
