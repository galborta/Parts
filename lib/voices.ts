/**
 * ElevenLabs Voice ID mapping for IFS archetypes.
 *
 * These are the 6 core archetypes + facilitator.
 * All voices should be multilingual (EN + ES capable).
 *
 * TODO: Replace placeholder IDs with actual ElevenLabs voice IDs
 * from the Voice Library. Pick multilingual voices that support
 * both English and Spanish.
 */

export interface ArchetypeVoice {
  id: string;
  label: string;           // Label used in multi-voice XML tags
  character: string;       // Voice character description
  voiceId: string;         // ElevenLabs voice ID
}

// Facilitator voice (default voice on the agent) — Victoria
export const FACILITATOR_VOICE: ArchetypeVoice = {
  id: 'facilitator',
  label: 'Facilitator',
  character: 'Warm, calm, reassuring — like a trusted therapist',
  voiceId: 'qSeXEcewz7tA0Q0qk9fH',
};

// Part archetype voices (additional voices on the agent)
export const ARCHETYPE_VOICES: Record<string, ArchetypeVoice> = {
  critic: {
    id: 'critic',
    label: 'InnerCritic',
    character: 'Clipped, precise, slightly cold — male, mature, authoritative',
    voiceId: 'DZyrV4biPT5EX8YED3PT',  // Mario
  },
  perfectionist: {
    id: 'perfectionist',
    label: 'Perfectionist',
    character: 'Fast, anxious, detail-oriented — female, sharp, energetic',
    voiceId: 'DZyrV4biPT5EX8YED3PT',  // Mario (reused — add unique voice later)
  },
  inner_child: {
    id: 'inner_child',
    label: 'InnerChild',
    character: 'Soft, small, vulnerable — young-sounding, gentle',
    voiceId: 'qSeXEcewz7tA0Q0qk9fH',  // Victoria (reused — add unique voice later)
  },
  protector: {
    id: 'protector',
    label: 'Protector',
    character: 'Strong, firm, defensive — deep male, commanding',
    voiceId: 'gSYqSbtMajxq5LUT0bNl',  // Eder
  },
  pleaser: {
    id: 'pleaser',
    label: 'Pleaser',
    character: 'Warm, eager, slightly desperate — female, bright, accommodating',
    voiceId: 'qSeXEcewz7tA0Q0qk9fH',  // Victoria (reused — add unique voice later)
  },
  exile: {
    id: 'exile',
    label: 'Exile',
    character: 'Quiet, fragile, hesitant — whispered, slow, trembling',
    voiceId: 'gSYqSbtMajxq5LUT0bNl',  // Eder (reused — add unique voice later)
  },
};

export const ARCHETYPES = Object.keys(ARCHETYPE_VOICES);

export function getVoiceForArchetype(archetype: string): string {
  const key = archetype.toLowerCase().replace(/\s+/g, '_');
  return ARCHETYPE_VOICES[key]?.voiceId || ARCHETYPE_VOICES.protector.voiceId;
}

export function getArchetypeVoice(archetype: string): ArchetypeVoice | undefined {
  const key = archetype.toLowerCase().replace(/\s+/g, '_');
  return ARCHETYPE_VOICES[key];
}

export function getAvailableArchetypes(): string[] {
  return ARCHETYPES;
}

/**
 * Build the additional voices config for the ElevenLabs agent.
 * Returns array of { label, voiceId } for the user's parts.
 */
export function buildAgentVoices(parts: { archetype: string }[]): { label: string; voiceId: string }[] {
  return parts.map(part => {
    const voice = getArchetypeVoice(part.archetype);
    return {
      label: voice?.label || 'Part',
      voiceId: voice?.voiceId || ARCHETYPE_VOICES.protector.voiceId,
    };
  });
}
