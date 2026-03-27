'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';

interface SelfNodeProps {
  selfLeadershipScore: number;
}

export default function SelfNode({ selfLeadershipScore }: SelfNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const radius = 0.3 + (selfLeadershipScore / 100) * 0.7;

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[radius, 64, 64]} />
      <MeshDistortMaterial
        color="#fbbf24"
        emissive="#fbbf24"
        emissiveIntensity={0.5}
        distort={0.3}
        speed={2}
        roughness={0.2}
      />
      <Html
        position={[0, -(radius + 0.3), 0]}
        center
        style={{
          color: '#fbbf24',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        Self
      </Html>
    </mesh>
  );
}
