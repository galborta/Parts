/**
 * Calculate 3D positions for parts in a golden-angle spiral around origin.
 * Returns array of [x, y, z] positions.
 */
export function calculateOrbitalPositions(count: number, radius: number = 3): [number, number, number][] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const positions: [number, number, number][] = [];

  for (let i = 0; i < count; i++) {
    const theta = goldenAngle * i;
    const y = 1 - (i / Math.max(count - 1, 1)) * 2; // y goes from 1 to -1
    const radiusAtY = Math.sqrt(1 - y * y) * radius;

    positions.push([
      Math.cos(theta) * radiusAtY,
      y * (radius * 0.5), // flatten the vertical spread
      Math.sin(theta) * radiusAtY,
    ]);
  }

  return positions;
}

// Archetype color mapping
export const ARCHETYPE_COLORS: Record<string, string> = {
  critic: '#ef4444',        // red - manager
  perfectionist: '#f97316', // orange - manager
  protector: '#f59e0b',     // amber - protector (warm)
  pleaser: '#ec4899',       // pink - manager
  inner_child: '#3b82f6',   // blue - exile (cool)
  exile: '#6366f1',         // indigo - exile (cool)
};

export function getArchetypeColor(archetype: string): string {
  return ARCHETYPE_COLORS[archetype.toLowerCase().replace(/\s+/g, '_')] || '#8b5cf6';
}
