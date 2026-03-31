'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { setLanguage } = useAppStore();

  const handleStart = () => {
    setLanguage('en');
    onComplete();
  };

  return (
    <div className="min-h-screen w-full bg-[#0f0c1a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-600/[0.05] rounded-full blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-amber-600/[0.04] rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0f0c1a_70%)]" />
      </div>

      <div className="relative z-10 max-w-xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-amber-500/20 border border-white/[0.06] flex items-center justify-center mx-auto mb-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
          >
            <span className="text-3xl">{'\u26A1'}</span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 tracking-tight">
            Welcome to Baseline
          </h2>
          <p className="text-base text-white/30 mb-6 leading-relaxed max-w-md mx-auto">
            Burnout has three dimensions: exhaustion, cynicism, and reduced efficacy.
            Most people only notice the first one. Baseline tracks all three.
          </p>
          <p className="text-base text-white/20 mb-12 leading-relaxed max-w-md mx-auto">
            Every day, three short voice sessions check in on your energy, your
            connection to meaning, and your sense of capability. Under a minute each.
          </p>
          <motion.button
            onClick={handleStart}
            className="btn-primary text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Begin Your First Session
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
