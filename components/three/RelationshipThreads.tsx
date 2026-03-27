'use client';

import { useMemo } from 'react';
import { Line } from '@react-three/drei';

interface PartWithPosition {
  id: string;
  protects: string[];
  position: [number, number, number];
}

interface RelationshipThreadsProps {
  parts: PartWithPosition[];
}

export default function RelationshipThreads({ parts }: RelationshipThreadsProps) {
  const lines = useMemo(() => {
    const result: { from: [number, number, number]; to: [number, number, number] }[] = [];
    const positionMap = new Map<string, [number, number, number]>();

    for (const part of parts) {
      positionMap.set(part.id, part.position);
    }

    for (const part of parts) {
      for (const protectedId of part.protects) {
        const targetPos = positionMap.get(protectedId);
        if (targetPos) {
          result.push({ from: part.position, to: targetPos });
        }
      }
    }

    return result;
  }, [parts]);

  return (
    <>
      {lines.map((line, i) => (
        <Line
          key={i}
          points={[line.from, line.to]}
          color="white"
          lineWidth={1}
          opacity={0.3}
          transparent
        />
      ))}
    </>
  );
}
