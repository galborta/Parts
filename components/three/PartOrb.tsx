'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { getArchetypeColor } from '@/lib/orbital';

interface PartOrbProps {
  position: [number, number, number];
  part: { id: string; name: string; archetype: string };
  index: number;
  onClick: (id: string) => void;
  isSelected: boolean;
}

export default function PartOrb({ position, part, index, onClick, isSelected }: PartOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const color = getArchetypeColor(part.archetype);
  const radius = hovered ? 0.5 : 0.4;

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() + index) * 0.002;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={hovered ? 1.2 : 1}
      onClick={(e) => {
        e.stopPropagation();
        onClick(part.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isSelected ? 0.8 : 0.3}
        transparent
        opacity={0.9}
      />
      {hovered && (
        <Html
          position={[0, -(radius + 0.25), 0]}
          center
          style={{
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            userSelect: 'none',
            pointerEvents: 'none',
            textShadow: '0 0 8px rgba(0,0,0,0.8)',
          }}
        >
          {part.name}
        </Html>
      )}
    </mesh>
  );
}
