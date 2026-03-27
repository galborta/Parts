'use client';

import { motion } from 'framer-motion';

interface VoiceOrbProps {
  isSpeaking: boolean;
  speakerName: string;
  color?: string;
}

export default function VoiceOrb({
  isSpeaking,
  speakerName,
  color = '#34d399',
}: VoiceOrbProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="relative w-[200px] h-[200px] rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${color}88, ${color}44, ${color}22)`,
          boxShadow: isSpeaking
            ? `0 0 60px ${color}66, 0 0 120px ${color}33`
            : `0 0 30px ${color}33, 0 0 60px ${color}18`,
        }}
        animate={
          isSpeaking
            ? {
                scale: [1.0, 1.15, 1.0],
                boxShadow: [
                  `0 0 60px ${color}66, 0 0 120px ${color}33`,
                  `0 0 80px ${color}88, 0 0 160px ${color}44`,
                  `0 0 60px ${color}66, 0 0 120px ${color}33`,
                ],
              }
            : { scale: 1.0 }
        }
        transition={
          isSpeaking
            ? {
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : { duration: 0.4, ease: 'easeOut' }
        }
      >
        {/* Inner glow ring */}
        <div
          className="absolute inset-4 rounded-full opacity-40"
          style={{
            background: `radial-gradient(circle at 40% 40%, ${color}cc, transparent 70%)`,
          }}
        />
      </motion.div>

      <motion.p
        className="text-sm font-medium tracking-wide text-white/80"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        key={speakerName}
        transition={{ duration: 0.3 }}
      >
        {speakerName}
      </motion.p>
    </div>
  );
}
