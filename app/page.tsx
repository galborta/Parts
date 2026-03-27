'use client';

import { motion } from 'framer-motion';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.push('/dashboard');
  }, [session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen w-full bg-[#080f0b] flex items-center justify-center">
        <motion.div
          className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-400"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#080f0b] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-600/[0.07] rounded-full blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-teal-600/[0.05] rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#080f0b_70%)]" />
      </div>

      {/* Nav */}
      <motion.nav
        className="relative z-10 flex items-center justify-between px-8 py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
            P
          </div>
          <span className="text-lg font-semibold text-white/90">Parts</span>
        </div>
      </motion.nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-6">
        <motion.div
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/40">3 questions a day. Real progress.</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[0.9] mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-white">Know yourself</span>
            <br />
            <span className="gradient-text">one question at a time.</span>
          </motion.h1>

          <motion.p
            className="text-lg text-white/25 max-w-md mx-auto mb-4 leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Every day, Parts asks you 3 questions that help you understand
            your inner world. Short voice conversations. Real insights. Visible growth.
          </motion.p>

          <motion.p
            className="text-sm text-white/12 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Based on Internal Family Systems — an evidence-based therapeutic model
          </motion.p>

          {/* CTA */}
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="group inline-flex items-center gap-3 btn-primary text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Start with Google
            </motion.button>
            <p className="text-xs text-white/10">Free. Takes 2 minutes a day.</p>
          </motion.div>
        </motion.div>

        {/* How it works */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mt-20 max-w-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {[
            { num: '1', text: 'Listen to a question' },
            { num: '2', text: 'Speak your answer' },
            { num: '3', text: 'See your insight' },
          ].map((step) => (
            <div key={step.num} className="flex items-center gap-3 glass rounded-xl px-4 py-3 flex-1">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                {step.num}
              </div>
              <span className="text-sm text-white/30">{step.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        className="relative z-10 flex items-center justify-center pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span className="text-xs text-white/10">Built for ElevenHacks #2 | Cloudflare + ElevenLabs</span>
      </motion.footer>
    </div>
  );
}
