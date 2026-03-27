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
      // Continue even if API fails — we'll sync later
    }

    onComplete();
  };

  const archetypes = getArchetypeOptions(language);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-xl w-full">
        <AnimatePresence mode="wait">
          {/* Step 0: Language Selection */}
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
              <h2 className="text-3xl font-bold text-white mb-8">
                {t('onboardingTitle', language)}
              </h2>
              <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                {t('onboardingIntro', language)}
              </p>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                {t('onboardingExplain', language)}
              </p>
              <motion.button
                onClick={() => setStep(2)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-lg hover:from-purple-500 hover:to-blue-500 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-8">
                {t('nameYourPart', language)}
              </h2>

              <input
                type="text"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                placeholder={t('partNamePlaceholder', language)}
                className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-lg placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 mb-8"
                autoFocus
              />

              <h3 className="text-xl text-slate-300 mb-6">
                {t('chooseArchetype', language)}
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {archetypes.map((arch) => (
                  <motion.button
                    key={arch.id}
                    onClick={() => setSelectedArchetype(arch.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedArchetype === arch.id
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-slate-700 bg-slate-800/30 text-slate-300 hover:border-slate-600'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-medium">{arch.name}</div>
                    <div className="text-sm text-slate-400 mt-1">{arch.description}</div>
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={handleCreatePart}
                disabled={!partName.trim() || !selectedArchetype}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-lg hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                whileHover={{ scale: partName.trim() && selectedArchetype ? 1.05 : 1 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('startExploring', language)}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
