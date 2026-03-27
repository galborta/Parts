'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: string;
}

interface TranscriptViewProps {
  entries: TranscriptEntry[];
}

function getSpeakerColor(speaker: string): string {
  switch (speaker.toLowerCase()) {
    case 'facilitator':
      return '#a855f7'; // purple
    case 'user':
      return '#ffffff'; // white
    default:
      return '#60a5fa'; // blue for part names
  }
}

function getSpeakerLabel(speaker: string): string {
  switch (speaker.toLowerCase()) {
    case 'facilitator':
      return 'Facilitator';
    case 'user':
      return 'You';
    default:
      return speaker;
  }
}

export default function TranscriptView({ entries }: TranscriptViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      {entries.length === 0 && (
        <p className="text-sm text-white/40 text-center py-8">
          Session transcript will appear here...
        </p>
      )}

      <AnimatePresence initial={false}>
        {entries.map((entry, i) => {
          const color = getSpeakerColor(entry.speaker);
          const label = getSpeakerLabel(entry.speaker);

          return (
            <motion.div
              key={`${entry.timestamp}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mb-3 last:mb-0"
            >
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color }}
              >
                {label}
              </span>
              <p className="text-sm text-white/90 mt-0.5 leading-relaxed">
                {entry.text}
              </p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
