const strings = {
  en: {
    // Landing
    tagline: 'Recover Your Baseline.',
    taglineSub: 'Three Sessions a Day.',
    subtitle: 'Voice coaching for high performers running below capacity',
    signIn: 'Sign in with Google',

    // Language selector
    chooseLanguage: 'Choose your language',
    english: 'English',
    spanish: 'Espanol',

    // Onboarding
    onboardingTitle: 'Welcome to Baseline',
    onboardingIntro: 'Burnout has three dimensions: exhaustion, cynicism, and reduced efficacy. Most people only notice the first one. Baseline tracks all three.',
    onboardingExplain: 'Every day, three short voice sessions check in on your energy, your connection to meaning, and your sense of capability. Under a minute each. Real signal, not guesswork.',
    onboardingReady: "Let's begin",

    // Voices
    voice_energy: 'The Energy Audit',
    voice_energy_desc: 'Where is your energy going?',
    voice_meaning: 'The Meaning Finder',
    voice_meaning_desc: 'What still matters to you?',
    voice_capability: 'The Capability Mirror',
    voice_capability_desc: 'What are you actually capable of?',

    // Session
    startSession: 'Start Session',
    endSession: 'End Session',
    speaking: 'Speaking...',
    listening: 'Listening...',

    // Dashboard
    recoveryIndex: 'Recovery Index',
    sessions: 'Sessions',
    streak: 'Streak',
    phase: 'Phase',
    theSignal: 'The Signal',
    recentSessions: 'Recent Sessions',

    // Dimensions
    exhaustion: 'Exhaustion',
    cynicism: 'Cynicism',
    efficacy: 'Efficacy',

    // Disclaimer
    disclaimer: 'Baseline is a coaching tool, not a substitute for medical or mental health care.',
  },

  es: {
    tagline: 'Recupera Tu Baseline.',
    taglineSub: 'Tres Sesiones al Dia.',
    subtitle: 'Coaching por voz para personas de alto rendimiento',
    signIn: 'Iniciar sesion con Google',

    chooseLanguage: 'Elige tu idioma',
    english: 'English',
    spanish: 'Espanol',

    onboardingTitle: 'Bienvenido a Baseline',
    onboardingIntro: 'El burnout tiene tres dimensiones: agotamiento, cinismo y eficacia reducida. La mayoria solo nota la primera. Baseline rastrea las tres.',
    onboardingExplain: 'Cada dia, tres sesiones cortas de voz revisan tu energia, tu conexion con el proposito y tu sentido de capacidad. Menos de un minuto cada una.',
    onboardingReady: 'Comencemos',

    voice_energy: 'Auditoria de Energia',
    voice_energy_desc: 'Donde se va tu energia?',
    voice_meaning: 'El Buscador de Sentido',
    voice_meaning_desc: 'Que todavia te importa?',
    voice_capability: 'El Espejo de Capacidad',
    voice_capability_desc: 'De que eres realmente capaz?',

    startSession: 'Iniciar Sesion',
    endSession: 'Terminar Sesion',
    speaking: 'Hablando...',
    listening: 'Escuchando...',

    recoveryIndex: 'Indice de Recuperacion',
    sessions: 'Sesiones',
    streak: 'Racha',
    phase: 'Fase',
    theSignal: 'La Senal',
    recentSessions: 'Sesiones Recientes',

    exhaustion: 'Agotamiento',
    cynicism: 'Cinismo',
    efficacy: 'Eficacia',

    disclaimer: 'Baseline es una herramienta de coaching, no un sustituto de atencion medica o de salud mental.',
  },
} as const;

export type Language = 'en' | 'es';
export type StringKey = keyof typeof strings.en;

export function t(key: StringKey, lang: Language = 'en'): string {
  return strings[lang][key] || strings.en[key] || key;
}
