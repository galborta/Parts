'use client';

import { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { calculateOrbitalPositions } from '@/lib/orbital';
import SelfNode from './SelfNode';
import PartOrb from './PartOrb';
import RelationshipThreads from './RelationshipThreads';
import ParticleField from './ParticleField';

interface PartData {
  id: string;
  name: string;
  archetype: string;
  protects: string[];
}

interface PartsMap3DProps {
  parts: PartData[];
  selfLeadershipScore: number;
  onPartClick: (id: string) => void;
}

function Scene({ parts, selfLeadershipScore, onPartClick }: PartsMap3DProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const positions = useMemo(
    () => calculateOrbitalPositions(parts.length),
    [parts.length]
  );

  const partsWithPositions = useMemo(
    () =>
      parts.map((part, i) => ({
        ...part,
        position: positions[i] || ([0, 0, 0] as [number, number, number]),
      })),
    [parts, positions]
  );

  const handlePartClick = (id: string) => {
    setSelectedId(id);
    onPartClick(id);
  };

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} />

      <SelfNode selfLeadershipScore={selfLeadershipScore} />

      {partsWithPositions.map((part, i) => (
        <PartOrb
          key={part.id}
          position={part.position}
          part={part}
          index={i}
          onClick={handlePartClick}
          isSelected={selectedId === part.id}
        />
      ))}

      <RelationshipThreads parts={partsWithPositions} />
      <ParticleField />

      <OrbitControls
        enablePan={false}
        maxDistance={15}
        minDistance={3}
        autoRotate
        autoRotateSpeed={0.3}
      />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.3}
          intensity={1.5}
          radius={0.8}
        />
      </EffectComposer>
    </>
  );
}

export default function PartsMap3D(props: PartsMap3DProps) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Suspense
        fallback={
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0a0a1a',
              color: '#666',
              fontSize: '14px',
            }}
          >
            Loading your parts map...
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 2, 8], fov: 50 }}
          style={{ background: '#0a0a1a' }}
        >
          <Scene {...props} />
        </Canvas>
      </Suspense>
    </div>
  );
}
