'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from './LanguageSelector';
import { t, getArchetypeOptions, type Language } from '@/lib/i18n';
import { useAppStore, usePartsStore } from '@/lib/store';
import { addPart, updateLanguage } from '@/lib/cloudflare';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const ARCHETYPE_ICONS: Record<string, string> = {
  critic: '⚡',
  perfectionist: '🎯',
  inner_child: '🌱',
  protector: '🛡',
  pleaser: '🤝',
  exile: '🌙',
};

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const { language, setLanguage } = useAppStore();
  const { addPart: addPartToStore } = usePartsStore();

  const [partName, setPartName] = useState('');
  const [selectedArchetype, setSelectedArchetype] = useState('');

  const handleLanguageSelect = async (lang: Language) => {
    setLanguage(lang);
    await updateLanguage(lang).catch(() => {});
    setStep(1);
  };

  const handleCreatePart = async () => {
    if (!partName.trim() || !selectedArchetype) return;

    try {
      const result = await addPart({
        name: partName.trim(),
        archetype: selectedArchetype,
        description: '',
        personality: '',
      });
      if (result.part) {
        addPartToStore(result.part);
      }
    } catch {
      // Continue even if API fails
    }

    onComplete();
  };

  const archetypes = getArchetypeOptions(language);

  return (
    <div className="min-h-screen w-full bg-[#08080f] flex items-center justify-center p-4 relative overflow-hidden grain">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-600/[0.05] rounded-full blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-indigo-600/[0.04] rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#08080f_70%)]" />
      </div>

      {/* Step indicator */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i <= step ? 'w-8 bg-violet-500/60' : 'w-4 bg-white/[0.06]'
            }`}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-xl w-full">
        <AnimatePresence mode="wait">
          {/* Step 0: Language */}
          {step === 0 && (
            <motion.div key="lang" exit={{ opacity: 0, y: -20 }}>
              <LanguageSelector onSelect={handleLanguageSelect} />
            </motion.div>
          )}

          {/* Step 1: IFS Introduction */}
          {step === 1 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-white/[0.06] flex items-center justify-center mx-auto mb-8"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
              >
                <span className="text-3xl">🧠</span>
              </motion.div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 tracking-tight">
                {t('onboardingTitle', language)}
              </h2>
              <p className="text-base text-white/30 mb-6 leading-relaxed max-w-md mx-auto">
                {t('onboardingIntro', language)}
              </p>
              <p className="text-base text-white/20 mb-12 leading-relaxed max-w-md mx-auto">
                {t('onboardingExplain', language)}
              </p>
              <motion.button
                onClick={() => setStep(2)}
                className="btn-primary text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('onboardingReady', language)}
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Name Your First Part */}
          {step === 2 && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                  {t('nameYourPart', language)}
                </h2>
                <p className="text-white/20">
                  {t('chooseArchetype', language)}
                </p>
              </div>

              <input
                type="text"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                placeholder={t('partNamePlaceholder', language)}
                className="input-dark text-lg mb-8"
                autoFocus
              />

              <div className="grid grid-cols-2 gap-3 mb-10">
                {archetypes.map((arch) => (
                  <motion.button
                    key={arch.id}
                    onClick={() => setSelectedArchetype(arch.id)}
                    className={`p-4 rounded-xl text-left transition-all duration-200 ${
                      selectedArchetype === arch.id
                        ? 'bg-violet-500/10 border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.1)]'
                        : 'glass glass-hover'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{ARCHETYPE_ICONS[arch.id] || '✦'}</span>
                      <span className={`font-medium ${
                        selectedArchetype === arch.id ? 'text-white' : 'text-white/70'
                      }`}>
                        {arch.name}
                      </span>
                    </div>
                    <div className="text-xs text-white/20 pl-7">{arch.description}</div>
                  </motion.button>
                ))}
              </div>

              <div className="text-center">
                <motion.button
                  onClick={handleCreatePart}
                  disabled={!partName.trim() || !selectedArchetype}
                  className="btn-primary text-lg disabled:opacity-20 disabled:cursor-not-allowed disabled:shadow-none"
                  whileHover={{ scale: partName.trim() && selectedArchetype ? 1.02 : 1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('startExploring', language)}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
