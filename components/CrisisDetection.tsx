'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CRISIS_KEYWORDS = [
  'kill myself', 'suicide', 'want to die', 'end my life', 'no reason to live',
  'better off dead', 'can\'t go on', 'quiero morir', 'suicidarme', 'acabar con todo',
  'no quiero vivir', 'matarme',
];

export function checkForCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lower.includes(keyword));
}

interface CrisisModalProps {
  isOpen: boolean;
  onAcknowledge: () => void;
}

export default function CrisisModal({ isOpen, onAcknowledge }: CrisisModalProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  const handleAcknowledge = () => {
    setAcknowledged(true);
    onAcknowledge();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="max-w-md mx-4 bg-slate-900 border border-slate-600 rounded-2xl p-8 text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="text-4xl mb-4">💙</div>
            <h2 className="text-xl font-bold text-white mb-4">
              You matter. Help is available.
            </h2>
            <p className="text-slate-300 mb-6 leading-relaxed">
              If you or someone you know is in crisis, please reach out to trained professionals who can help.
            </p>

            <div className="space-y-3 mb-8">
              <a
                href="tel:988"
                className="block p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl text-white hover:bg-blue-600/30 transition-colors"
              >
                <div className="font-semibold">988 Suicide & Crisis Lifeline</div>
                <div className="text-sm text-blue-300">Call or text 988 (US)</div>
              </a>
              <a
                href="sms:741741&body=HOME"
                className="block p-4 bg-green-600/20 border border-green-500/30 rounded-xl text-white hover:bg-green-600/30 transition-colors"
              >
                <div className="font-semibold">Crisis Text Line</div>
                <div className="text-sm text-green-300">Text HOME to 741741</div>
              </a>
            </div>

            <p className="text-xs text-slate-400 mb-6">
              Parts is not therapy and cannot replace professional mental health care.
            </p>

            <button
              onClick={handleAcknowledge}
              className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
            >
              I understand, continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
