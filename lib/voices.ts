// ElevenLabs Voice ID mapping for IFS archetypes
// TODO: Replace placeholder IDs with actual ElevenLabs voice IDs

export const ARCHETYPE_VOICES: Record<string, string> = {
  // The protective, cautious part that keeps you safe
  Protector: 'voice_protector_placeholder_001',

  // The critical, perfectionist part that drives achievement
  Critic: 'voice_critic_placeholder_002',

  // The vulnerable, sensitive part that holds pain
  Exile: 'voice_exile_placeholder_003',

  // The wise, compassionate internal parent
  SelfLeader: 'voice_self_leader_placeholder_004',

  // The fun-loving, energetic, spontaneous part
  Playmaker: 'voice_playmaker_placeholder_005',

  // The ambitious, driven achiever part
  Achiever: 'voice_achiever_placeholder_006',

  // The caretaker, people-pleaser part
  Caretaker: 'voice_caretaker_placeholder_007',

  // The rebel, non-conformist part
  Rebel: 'voice_rebel_placeholder_008',
};

export const ARCHETYPES = Object.keys(ARCHETYPE_VOICES);

export function getVoiceForArchetype(archetype: string): string {
  return ARCHETYPE_VOICES[archetype] || ARCHETYPE_VOICES.SelfLeader;
}

export function getAvailableArchetypes(): string[] {
  return ARCHETYPES;
}
