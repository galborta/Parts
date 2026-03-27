const strings = {
  en: {
    // Landing
    tagline: 'Talk to Your Inner Parts.',
    taglineSub: 'Hear Them Talk Back.',
    subtitle: 'An IFS therapy companion powered by ElevenLabs voice AI',
    signIn: 'Sign in with Google',

    // Language selector
    chooseLanguage: 'Choose your language',
    english: 'English',
    spanish: 'Español',

    // Onboarding
    onboardingTitle: 'Welcome to Parts',
    onboardingIntro: 'Your mind is naturally multiple. You have different parts — an inner critic, a protector, an inner child. Each has its own voice, its own fears, its own gifts.',
    onboardingExplain: 'In IFS (Internal Family Systems) therapy, you turn toward these parts with curiosity instead of judgment. Parts helps you do exactly that — with AI voices that bring each part to life.',
    onboardingReady: "Let's meet your first part",
    nameYourPart: 'Name your first part',
    partNamePlaceholder: 'e.g., The Critic, Little Me, The Guard...',
    chooseArchetype: 'What kind of part is this?',
    continue: 'Continue',
    startExploring: 'Start Exploring',

    // Archetypes
    archetype_critic: 'Inner Critic',
    archetype_critic_desc: 'The voice that tells you you\'re not enough',
    archetype_perfectionist: 'Perfectionist',
    archetype_perfectionist_desc: 'Driven by the need to get everything right',
    archetype_inner_child: 'Inner Child',
    archetype_inner_child_desc: 'The young, vulnerable part that holds old wounds',
    archetype_protector: 'Protector',
    archetype_protector_desc: 'Keeps you safe by building walls',
    archetype_pleaser: 'Pleaser',
    archetype_pleaser_desc: 'Seeks approval and avoids conflict at all costs',
    archetype_exile: 'Exile',
    archetype_exile_desc: 'Hidden away — carries the deepest pain',

    // Session
    startSession: 'Start Session',
    endSession: 'End Session',
    speaking: 'Speaking...',
    listening: 'Listening...',
    sessionWith: 'Session with',

    // Dashboard
    yourParts: 'Your Parts',
    newPart: '+ New Part',
    sessions: 'Sessions',
    insights: 'Insights',
    selfLeadership: 'Self-Leadership',

    // Disclaimer
    disclaimer: 'Parts is not therapy and is not a replacement for professional mental health care.',
  },

  es: {
    tagline: 'Habla con Tus Partes Internas.',
    taglineSub: 'Escúchalas Responder.',
    subtitle: 'Un compañero de terapia IFS impulsado por ElevenLabs',
    signIn: 'Iniciar sesión con Google',

    chooseLanguage: 'Elige tu idioma',
    english: 'English',
    spanish: 'Español',

    onboardingTitle: 'Bienvenido a Parts',
    onboardingIntro: 'Tu mente es naturalmente múltiple. Tienes diferentes partes — un crítico interno, un protector, un niño interior. Cada una tiene su propia voz, sus propios miedos, sus propios dones.',
    onboardingExplain: 'En la terapia IFS (Sistemas Familiares Internos), te acercas a estas partes con curiosidad en vez de juicio. Parts te ayuda a hacer exactamente eso — con voces de IA que dan vida a cada parte.',
    onboardingReady: 'Conozcamos tu primera parte',
    nameYourPart: 'Nombra tu primera parte',
    partNamePlaceholder: 'ej., El Crítico, Mi Niño Interior, El Guardián...',
    chooseArchetype: '¿Qué tipo de parte es?',
    continue: 'Continuar',
    startExploring: 'Comenzar a Explorar',

    archetype_critic: 'Crítico Interno',
    archetype_critic_desc: 'La voz que te dice que no eres suficiente',
    archetype_perfectionist: 'Perfeccionista',
    archetype_perfectionist_desc: 'Impulsado por la necesidad de hacerlo todo perfecto',
    archetype_inner_child: 'Niño Interior',
    archetype_inner_child_desc: 'La parte joven y vulnerable que guarda heridas antiguas',
    archetype_protector: 'Protector',
    archetype_protector_desc: 'Te mantiene a salvo construyendo muros',
    archetype_pleaser: 'Complaciente',
    archetype_pleaser_desc: 'Busca aprobación y evita el conflicto a toda costa',
    archetype_exile: 'Exiliado',
    archetype_exile_desc: 'Escondido — carga el dolor más profundo',

    startSession: 'Iniciar Sesión',
    endSession: 'Terminar Sesión',
    speaking: 'Hablando...',
    listening: 'Escuchando...',
    sessionWith: 'Sesión con',

    yourParts: 'Tus Partes',
    newPart: '+ Nueva Parte',
    sessions: 'Sesiones',
    insights: 'Descubrimientos',
    selfLeadership: 'Auto-Liderazgo',

    disclaimer: 'Parts no es terapia y no reemplaza la atención profesional de salud mental.',
  },
} as const;

export type Language = 'en' | 'es';
export type StringKey = keyof typeof strings.en;

export function t(key: StringKey, lang: Language = 'en'): string {
  return strings[lang][key] || strings.en[key] || key;
}

export function getArchetypeOptions(lang: Language = 'en') {
  return [
    { id: 'critic', name: t('archetype_critic', lang), description: t('archetype_critic_desc', lang) },
    { id: 'perfectionist', name: t('archetype_perfectionist', lang), description: t('archetype_perfectionist_desc', lang) },
    { id: 'inner_child', name: t('archetype_inner_child', lang), description: t('archetype_inner_child_desc', lang) },
    { id: 'protector', name: t('archetype_protector', lang), description: t('archetype_protector_desc', lang) },
    { id: 'pleaser', name: t('archetype_pleaser', lang), description: t('archetype_pleaser_desc', lang) },
    { id: 'exile', name: t('archetype_exile', lang), description: t('archetype_exile_desc', lang) },
  ];
}
