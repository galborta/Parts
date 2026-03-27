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
      className="flex flex-col items-center gap-10"
    >
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
          Choose your language
        </h2>
        <p className="text-white/20 text-lg">Elige tu idioma</p>
      </div>

      <div className="flex gap-4">
        {[
          { lang: 'en' as Language, flag: '🇺🇸', label: 'English', sublabel: 'Continue in English' },
          { lang: 'es' as Language, flag: '🇪🇸', label: 'Español', sublabel: 'Continuar en Español' },
        ].map(({ lang, flag, label, sublabel }) => (
          <motion.button
            key={lang}
            onClick={() => onSelect(lang)}
            className="group relative w-48 py-8 rounded-2xl glass glass-hover text-center cursor-pointer"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-5xl block mb-4">{flag}</span>
            <span className="text-lg font-medium text-white block">{label}</span>
            <span className="text-xs text-white/20 mt-1 block">{sublabel}</span>

            {/* Hover glow */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ boxShadow: '0 0 40px rgba(139, 92, 246, 0.1)' }}
            />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
