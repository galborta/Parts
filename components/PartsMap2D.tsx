'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface PartData {
  id: string;
  name: string;
  archetype: string;
  protects: string[];
}

interface PartsMap2DProps {
  parts: PartData[];
  selfLeadershipScore: number;
  onPartClick: (id: string) => void;
}

const ARCHETYPE_COLORS: Record<string, string> = {
  critic: '#ef4444',
  perfectionist: '#f97316',
  protector: '#f59e0b',
  pleaser: '#ec4899',
  inner_child: '#3b82f6',
  exile: '#6366f1',
};

const ARCHETYPE_ICONS: Record<string, string> = {
  critic: '⚡',
  perfectionist: '🎯',
  inner_child: '🌱',
  protector: '🛡',
  pleaser: '🤝',
  exile: '🌙',
};

function getColor(archetype: string): string {
  return ARCHETYPE_COLORS[archetype.toLowerCase().replace(/\s+/g, '_')] || '#8b5cf6';
}

function getIcon(archetype: string): string {
  return ARCHETYPE_ICONS[archetype.toLowerCase().replace(/\s+/g, '_')] || '✦';
}

function calculatePositions(count: number, centerX: number, centerY: number, radius: number): [number, number][] {
  if (count === 0) return [];
  if (count === 1) return [[centerX, centerY - radius]];

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const positions: [number, number][] = [];

  for (let i = 0; i < count; i++) {
    const angle = goldenAngle * i - Math.PI / 2;
    const r = radius * (0.6 + (i / Math.max(count, 1)) * 0.4);
    positions.push([
      centerX + Math.cos(angle) * r,
      centerY + Math.sin(angle) * r,
    ]);
  }

  return positions;
}

export default function PartsMap2D({ parts, selfLeadershipScore, onPartClick }: PartsMap2DProps) {
  const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
  const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 400;
  const radius = Math.min(centerX, centerY) * 0.55;

  const positions = useMemo(
    () => calculatePositions(parts.length, centerX, centerY, radius),
    [parts.length, centerX, centerY, radius]
  );

  const selfSize = 40 + (selfLeadershipScore / 100) * 40;

  return (
    <div className="absolute inset-0 bg-[#08080f] overflow-hidden">
      {/* Background particles */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute w-[2px] h-[2px] rounded-full bg-white/[0.05]"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.02, 0.08, 0.02],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}

      {/* Relationship lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        {parts.map((part, i) => {
          if (!part.protects || part.protects.length === 0) return null;
          return part.protects.map((protectedId) => {
            const targetIdx = parts.findIndex(p => p.id === protectedId);
            if (targetIdx === -1) return null;
            const from = positions[i];
            const to = positions[targetIdx];
            if (!from || !to) return null;
            return (
              <motion.line
                key={`${part.id}-${protectedId}`}
                x1={from[0]}
                y1={from[1]}
                x2={to[0]}
                y2={to[1]}
                stroke="rgba(139, 92, 246, 0.15)"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            );
          });
        })}
      </svg>

      {/* Self node at center */}
      <motion.div
        className="absolute rounded-full flex items-center justify-center"
        style={{
          left: centerX - selfSize / 2,
          top: centerY - selfSize / 2,
          width: selfSize,
          height: selfSize,
          background: 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, rgba(251,191,36,0.05) 70%, transparent 100%)',
          boxShadow: '0 0 60px rgba(251,191,36,0.15), 0 0 120px rgba(251,191,36,0.05)',
          zIndex: 2,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
      >
        <motion.div
          className="w-3/5 h-3/5 rounded-full bg-amber-400/30 backdrop-blur-sm border border-amber-300/20"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="absolute -bottom-6 text-[10px] text-white/20 font-medium">Self</span>
      </motion.div>

      {/* Part orbs */}
      {parts.map((part, i) => {
        const pos = positions[i];
        if (!pos) return null;
        const color = getColor(part.archetype);
        const icon = getIcon(part.archetype);

        return (
          <motion.button
            key={part.id}
            className="absolute flex flex-col items-center gap-2 group"
            style={{
              left: pos[0] - 32,
              top: pos[1] - 32,
              zIndex: 3,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.3 + i * 0.1 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPartClick(part.id)}
          >
            {/* Glow */}
            <div
              className="absolute w-16 h-16 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"
              style={{ backgroundColor: color }}
            />
            {/* Orb */}
            <motion.div
              className="relative w-16 h-16 rounded-full flex items-center justify-center border backdrop-blur-sm"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${color}40, ${color}15)`,
                borderColor: `${color}30`,
                boxShadow: `0 0 20px ${color}20`,
              }}
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <span className="text-xl">{icon}</span>
            </motion.div>
            {/* Label */}
            <span className="text-[11px] text-white/40 font-medium whitespace-nowrap">
              {part.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
