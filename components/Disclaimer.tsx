'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { t, type Language } from '@/lib/i18n';

interface DisclaimerProps {
  isOpen: boolean;
  language: Language;
  onAccept: () => void;
}

export default function Disclaimer({ isOpen, language, onAccept }: DisclaimerProps) {
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
            className="max-w-lg mx-4 bg-slate-900 border border-slate-700 rounded-2xl p-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-xl font-bold text-white mb-4">Before you begin</h2>

            <div className="space-y-4 text-sm text-slate-300 mb-8">
              <p>{t('disclaimer', language)}</p>
              <p>
                Parts uses AI to simulate therapeutic dialogue based on Internal Family Systems (IFS) principles.
                It does not diagnose, treat, or cure any mental health condition.
              </p>
              <p>
                If you are in crisis or experiencing severe distress, please contact a mental health professional
                or call the 988 Suicide & Crisis Lifeline.
              </p>
              <p>
                Your session data is stored securely and is private to your account.
                You can request deletion of all your data at any time.
              </p>
            </div>

            <button
              onClick={onAccept}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-blue-500 transition-all"
            >
              I understand, let&apos;s begin
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
