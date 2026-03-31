/**
 * Baseline Voice Configuration
 * 3 fixed voices mapping to the 3 burnout dimensions.
 */

export interface Voice {
  id: string;
  name: string;
  role: string;
  dimension: 'exhaustion' | 'cynicism' | 'efficacy';
  color: string;
  icon: string;
  voiceId: string;   // ElevenLabs voice ID
  character: string;
}

export const VOICES: Voice[] = [
  {
    id: 'energy',
    name: 'Eder',
    role: 'The Energy Audit',
    dimension: 'exhaustion',
    color: '#f59e0b',   // amber
    icon: '\u26A1',
    voiceId: 'gSYqSbtMajxq5LUT0bNl',
    character: 'Direct, focused, no-nonsense — like a sharp operator who sees where energy leaks',
  },
  {
    id: 'meaning',
    name: 'Mario',
    role: 'The Meaning Finder',
    dimension: 'cynicism',
    color: '#8b5cf6',   // violet
    icon: '\uD83C\uDFAF',
    voiceId: 'DZyrV4biPT5EX8YED3PT',
    character: 'Warm but probing — asks the questions that reconnect you to purpose',
  },
  {
    id: 'capability',
    name: 'Victoria',
    role: 'The Capability Mirror',
    dimension: 'efficacy',
    color: '#34d399',   // emerald
    icon: '\uD83D\uDCAA',
    voiceId: 'qSeXEcewz7tA0Q0qk9fH',
    character: 'Confident, affirming — reflects your competence back to you',
  },
];

export function getVoiceByIndex(index: number): Voice {
  return VOICES[index] || VOICES[0];
}

export function getVoiceById(id: string): Voice | undefined {
  return VOICES.find((v) => v.id === id);
}
