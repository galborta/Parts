'use client';

import { motion } from 'framer-motion';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen w-full bg-[#08080f] flex items-center justify-center">
        <motion.div
          className="w-12 h-12 rounded-full border-2 border-violet-500/30 border-t-violet-400"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#08080f] relative overflow-hidden grain">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large gradient orbs */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-600/[0.07] rounded-full blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-600/[0.05] rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/[0.04] rounded-full blur-[100px] animate-pulse-glow" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#08080f_70%)]" />
      </div>

      {/* Navigation */}
      <motion.nav
        className="relative z-10 flex items-center justify-between px-8 py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
              <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.9" />
              <circle cx="12" cy="4" r="2" fill="currentColor" opacity="0.5" />
              <circle cx="20" cy="12" r="2" fill="currentColor" opacity="0.5" />
              <circle cx="12" cy="20" r="2" fill="currentColor" opacity="0.5" />
              <circle cx="4" cy="12" r="2" fill="currentColor" opacity="0.5" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-white/90">Parts</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/galborta/Parts"
            className="text-sm text-white/30 hover:text-white/60 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </motion.nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-180px)] px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/50 tracking-wide">Powered by ElevenLabs Voice AI</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="text-white">Talk to your</span>
            <br />
            <span className="gradient-text">inner parts.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl text-white/30 max-w-lg mx-auto mb-4 leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Your inner critic has a voice. Your protector has a story.
            <br className="hidden sm:block" />
            {' '}What happens when you finally listen?
          </motion.p>

          {/* IFS credential */}
          <motion.p
            className="text-sm text-white/15 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Based on Internal Family Systems — an evidence-based therapeutic model
          </motion.p>

          {/* CTA */}
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <motion.button
              onClick={handleSignIn}
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-medium text-white text-lg transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(99, 102, 241, 0.9))',
                boxShadow: '0 4px 24px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
              whileHover={{
                scale: 1.02,
                boxShadow: '0 8px 40px rgba(139, 92, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
              <svg className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.button>

            <p className="text-xs text-white/15">Free to start. No credit card required.</p>
          </motion.div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mt-20 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {[
            { icon: '🎙', text: 'Distinct voice per part' },
            { icon: '🧠', text: 'Evidence-based IFS model' },
            { icon: '🌐', text: 'English & Spanish' },
            { icon: '🗺', text: '3D parts map' },
          ].map((pill) => (
            <div
              key={pill.text}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass text-xs text-white/30"
            >
              <span>{pill.icon}</span>
              <span>{pill.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        className="relative z-10 flex items-center justify-center pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className="flex items-center gap-2 text-xs text-white/15">
          <span>Built for</span>
          <span className="text-white/25 font-medium">ElevenHacks #2</span>
          <span className="text-white/10">|</span>
          <span>Cloudflare Workers</span>
        </div>
      </motion.footer>
    </div>
  );
}
