# Parts — Talk to Your Inner Parts. Hear Them Talk Back.

## What This Is

Parts is an IFS (Internal Family Systems) therapy companion that gives each of your inner parts its own distinct AI voice. You speak to a warm facilitator, identify a part (your Inner Critic, your Perfectionist, your Inner Child), and then *hear that part speak back to you* in its own unique voice via ElevenLabs.

Every session is stored in a Cloudflare Durable Object — one per user, persistent forever. Your parts map grows richer over time. The app tracks relationships between parts, surfaces cross-session insights, and measures your progress toward Self-leadership (the IFS north star).

**Built for ElevenHacks #2: Cloudflare × ElevenLabs**

---

## The IFS Science

Internal Family Systems was developed by Dr. Richard Schwartz, is listed by SAMHSA as an evidence-based practice, is used in PTSD treatment at the VA, and is taught at Harvard Medical School.

Three core claims:

1. **The mind is naturally multiple.** You've experienced this — part of you wants to quit, part of you is afraid to. IFS says these are distinct sub-personalities with their own histories, fears, and intentions.

2. **Every part has a positive intention.** Your inner critic isn't evil — it's trying to protect you from failure or rejection. It's a *protector*.

3. **Beneath all parts is Self** — calm, curious, compassionate, clear. The therapeutic north is reaching Self-leadership: when you can sit with any part and feel genuinely curious about it instead of fused with it or overwhelmed by it.

### How an IFS Session Actually Works

This matters for the architecture:

- A session typically focuses on **one primary part**, but others may surface
- The therapist (our facilitator) helps you **locate** the part — where do you feel it in your body?
- You **turn toward** the part and notice what it looks like, what it's feeling
- You **dialogue** with it — "What are you afraid of?" "What do you need from me?"
- The part responds through feelings, images, or internal voice
- Other parts may **interrupt** — a protector might step in when you get close to an exile
- The goal each session: get **Self** into relationship with the part. Even 30 seconds of genuine curiosity toward a part is therapeutic progress.

### Session Model for MVP

For the hackathon, each session focuses on **one part at a time**:

```
Facilitator guides → User identifies/names a part → Voice switches to that part →
User dialogues with part → Facilitator returns to process → Session summary
```

Each part keeps the **same voice across all sessions** (your Inner Critic always sounds the same). This builds familiarity and emotional continuity — exactly like how in real IFS, parts develop a consistent "character" over time.

Post-hackathon: multi-part sessions where protectors can interrupt and exiles can emerge organically.

---

## Tech Stack

```
Frontend        Next.js 15 (App Router, TypeScript) + Tailwind CSS
3D Map          react-three-fiber + @react-three/drei + @react-three/postprocessing (Three.js)
UI Animations   Framer Motion (page transitions, panels, onboarding — NOT the 3D map)
Auth            Auth.js (NextAuth) — Sign in with Google → JWT
Edge Runtime    Cloudflare Workers (auth validation, routing, WebSocket upgrade)
State           Cloudflare Durable Objects (1 per user — persistent psyche, split-key storage)
AI Inference    Cloudflare Workers AI (session summaries, insight generation)
Voice Agent     ElevenLabs Conversational AI (multi-voice: facilitator + parts in one agent)
Language        English + Spanish (ElevenLabs multilingual models + language detection tool)
State Mgmt      Zustand (client-side state)
Deployment      Cloudflare Pages (frontend) + Workers (backend)
Repo            github.com/galborta/Parts
```

**Removed from MVP:** Vectorize (post-MVP), separate ElevenLabs TTS (replaced by native multi-voice)
**Added:** react-three-fiber, Zustand, English/Spanish language support

---

## Architecture

```
Browser (Next.js on CF Pages)
    │
    ├── Auth: Sign in with Google (Auth.js → JWT)
    │
    ├── Language Selection: English / Spanish (stored in DO, sent to ElevenLabs)
    │
    ├── ElevenLabs Conversational AI (multi-voice agent, runs in browser)
    │   ├── Default voice = Facilitator (warm, calm, guides)
    │   ├── Additional voices = Parts (up to 9, one per archetype)
    │   ├── Voice switching via XML tags: <InnerCritic>text</InnerCritic>
    │   └── Language detection tool for mid-session EN↔ES switching
    │
    ├── WebSocket connection to CF Worker
    │       │
    │       ▼
    │   CF Worker validates JWT, routes to user's Durable Object
    │       │
    │       ▼
    │   Durable Object (1 per user — THE persistent psyche)
    │   ├── meta — profile, language, onboarding state
    │   ├── parts — name, voiceId, role, fear, archetype
    │   ├── session:{id} — one key per session transcript (avoids 128KB limit)
    │   ├── session_index — lightweight session list for UI
    │   ├── insights — aggregated cross-session insights
    │   └── score — selfLeadershipScore history
    │       │
    │       └── → Workers AI (session summaries, insight generation)
    │
    └── Parts Map UI (react-three-fiber 3D visualization)
        ├── Glowing 3D spheres for each part (bloom post-processing)
        ├── Luminous threads between related parts
        ├── Self node at center (grows as Self-leadership increases)
        ├── OrbitControls for rotation/zoom
        └── Particle field background for depth
```

### The Architecture Insight for Judges

One Durable Object per user IS the IFS model in code. The user's psyche is a persistent, stateful, always-addressable entity at the edge. It holds their parts, remembers every conversation, and is alive forever. That's not a metaphor — it's genuinely the right primitive for this problem.

---

## Voice Architecture (The Key Technical Decision)

### The Voice Switch — This Is the Entire Product

When you're talking to the facilitator and ask to speak with a part, the voice must change noticeably and immediately. That moment of hearing a different voice speak as your inner critic is the entire product in 2 seconds.

### Implementation: Native Multi-Voice Conversational AI

ElevenLabs Conversational AI supports up to **10 voices per agent** with XML-style switching tags. This eliminates the complex "pause ConvAI → TTS → resume" choreography entirely.

- **Single agent, single WebSocket session** — facilitator AND all parts run through one Conversational AI agent
- **Default voice** = Facilitator (warm, calm, guides the session)
- **Additional voices** (up to 9) = user's parts, one per archetype
- **Voice switching** via XML tags in agent output: `<InnerCritic>Because if I don't push you, you get complacent.</InnerCritic>`
- **The agent's system prompt** contains IFS facilitation logic, the user's known parts with their personalities/wounds/gifts, and instructions for when to switch voices
- **No separate TTS calls**, no WebSocket juggling, no pause/resume choreography
- **Multilingual voices** support both English and Spanish natively via Flash v2.5 / Multilingual v2 models
- **Language detection system tool** (added March 2025) enables mid-conversation EN↔ES switching

### The Switch Flow (Simplified)

```
User speaks → ElevenLabs agent receives audio → Agent decides whether to respond as
facilitator or as a part → If part: wraps response in <PartName> XML tags →
ElevenLabs automatically switches to that part's voice → User hears the part speak
```

Zero client-side orchestration needed for voice switching. The agent handles it all.

### 6 Preset Part Voices (Hackathon)

Pick 6 archetypal **multilingual** voices from ElevenLabs' voice library that sound natural in both English and Spanish. Don't do custom cloning for the hackathon.

| Archetype | Voice Character | Example Voice |
|-----------|----------------|---------------|
| Inner Critic | Clipped, precise, slightly cold | Male, mature, authoritative |
| Perfectionist | Fast, anxious, detail-oriented | Female, sharp, energetic |
| Inner Child | Soft, small, vulnerable | Young-sounding, gentle |
| Protector | Strong, firm, defensive | Deep male, commanding |
| Pleaser | Warm, eager, slightly desperate | Female, bright, accommodating |
| Exile (wounded) | Quiet, fragile, hesitant | Whispered, slow, trembling |

**Voice budget:** 1 facilitator + 6 archetypes = 7 voices. Well within the 10-voice limit. Use multilingual voices so the same voice handles both EN and ES — no need for per-language duplicates.

Users can reassign voices to their parts later. For hackathon, auto-assign based on the archetype the user picks or the AI infers.

---

## Authentication

### Flow

```
1. User lands on parts.app → sees landing page
2. Clicks "Sign in with Google" → Auth.js handles OAuth2 flow
3. Auth.js creates session → generates JWT with user's Google ID + email
4. JWT stored in httpOnly cookie
5. On WebSocket connect: CF Worker reads JWT from cookie, validates signature
6. Worker routes to Durable Object named by Google ID (deterministic: same user = same DO)
7. First visit: DO initializes empty parts map + onboarding state
8. Return visit: DO loads existing parts, session history, insights
```

### Why Google Auth Matters

- Durable Object ID is derived from Google account → your psyche is uniquely yours
- No anonymous usage (protects against abuse, required for persistent state)
- Email available for therapist sharing feature ($49/mo tier)
- Simple, trusted, one-click

---

## Data Model (Durable Object State)

```typescript
interface UserPsyche {
  userId: string;              // Google OAuth ID
  email: string;
  language: 'en' | 'es';      // User's chosen language
  createdAt: string;

  parts: Part[];
  sessions: Session[];
  insights: Insight[];
  selfLeadershipScore: number; // 0-100, computed metric

  onboarding: {
    completed: boolean;
    currentStep: number;
  };
}

// DO Storage Strategy: split into separate keys to avoid 128KB limit
// 'meta'           → { userId, email, language, onboarding, createdAt }
// 'parts'          → Part[]
// 'session:{id}'   → Session (one key per session)
// 'session_index'  → { id, startedAt, primaryPartId, duration }[]
// 'insights'       → Insight[]
// 'score'          → { current: number, history: { date, score }[] }

interface Part {
  id: string;
  name: string;               // User-given: "The Critic", "Little Me", etc.
  archetype: string;           // System-detected: critic, protector, exile, etc.
  voiceId: string;             // ElevenLabs voice ID

  role: string;                // What this part does: "Keeps me from failing"
  fear: string;                // What it's afraid of: "Being exposed as fraud"
  protects: string[];          // IDs of parts it protects (protector → exile)

  dialogueHistory: DialogueTurn[];
  discoveredAt: string;
  lastSpokenTo: string;
  sessionCount: number;

  unburdened: boolean;         // IFS: has this part released its burden?
}

interface Session {
  id: string;
  startedAt: string;
  endedAt: string;
  primaryPartId: string;       // The part this session focused on

  transcript: TranscriptEntry[];
  insights: string[];          // AI-generated insights from this session
  selfLeadershipBefore: number;
  selfLeadershipAfter: number;

  summary: string;             // AI-generated session summary
}

interface Insight {
  id: string;
  text: string;                // "You've mentioned your father 9 times across 3 parts"
  relatedPartIds: string[];
  surfacedAt: string;
  sessionId: string;
  acknowledged: boolean;
}

interface DialogueTurn {
  speaker: 'user' | 'part' | 'facilitator';
  text: string;
  timestamp: string;
  emotion?: string;            // AI-detected emotion
}

interface TranscriptEntry {
  speaker: 'user' | 'facilitator' | string; // string = part name
  text: string;
  timestamp: string;
}
```

---

## Parts Map UI (The Viral Visual)

### Core: react-three-fiber 3D Visualization

- Parts rendered as **softly glowing 3D spheres** floating in space around a central **Self** node
- **Bloom post-processing** for the glow effect (via @react-three/postprocessing EffectComposer)
- **OrbitControls** for user rotation/zoom (drei)
- **MeshDistortMaterial** on Self node for organic, living appearance
- Each part-orb colored by archetype: warm oranges/reds = protectors, cool blues = exiles, neutral = managers
- **Luminous threads** (animated line geometry) connecting related parts (protector → exile)
- **Particle field** background for depth and atmosphere
- **Self node grows** as selfLeadershipScore increases
- Hover: orb scales up, name label appears (drei Html/Text)
- Click: opens part detail panel, can start session
- **Golden-angle spiral** positioning for aesthetic orbital layout
- New parts animate in with spring-like interpolation via useFrame

### Animation Libraries

```
react-three-fiber for:
  - 3D scene rendering (Canvas, useFrame, useThree)
  - Orbital sphere layout with smooth floating animation
  - Bloom glow post-processing
  - Interactive 3D controls (OrbitControls)
  - Hover/click interactions on 3D objects

framer-motion for (UI only, NOT the 3D map):
  - Page transitions and route animations
  - Panel slide-ins (part detail, session view)
  - Onboarding flow step transitions
  - Button hover/tap animations
  - AnimatePresence for modal/overlay entrances
```

### Visual Targets for Video

The parts map is what people screenshot and share. It must look stunning in 3D:
- Dark background, glowing spheres with bloom post-processing
- Slow orbital floating motion (sine wave via useFrame)
- Luminous threads that animate between connected parts
- Particle field giving depth and a "floating in your psyche" feeling
- Self node at center with distinct radiance (MeshDistortMaterial + emissive)
- Smooth camera orbit on idle for cinematic video footage

---

## API Routes (Next.js)

```
/api/auth/[...nextauth]    Auth.js Google OAuth handlers
/api/session/start         Start new session (connects to DO, gets facilitator ready)
/api/session/end           End session (triggers summary, insight generation)
/api/parts                 GET: list user's parts. POST: create new part
/api/parts/[id]            GET: part detail. PATCH: update part
/api/insights              GET: user's insights
/api/ws                    WebSocket upgrade → CF Worker → Durable Object
```

---

## Cloudflare Worker Routes

```
/ws                        WebSocket upgrade, JWT validation, route to DO
/api/do/*                  Proxy to Durable Object methods
```

---

## Environment Variables

```bash
# ── Auth ──────────────────────────────────────────────────
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://parts.app

# ── ElevenLabs ────────────────────────────────────────────
ELEVENLABS_API_KEY=xi-...
NEXT_PUBLIC_ELEVENLABS_FACILITATOR_AGENT_ID=...

# ── Cloudflare ────────────────────────────────────────────
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...

# ── App ───────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://parts.app
```

---

## Build Order — What to Ship First

### Phase 1: Auth + Storage Foundation (45 min)
Auth.js Google OAuth, JWT strategy, DO split-key storage restructure, worker JWT validation, client helpers.

### Phase 2: Language Selection + Onboarding (30 min)
EN/ES picker, i18n dictionary, onboarding flow (language → IFS intro → name first part → map), dashboard page with auth guard.

### Phase 3: ElevenLabs Multi-Voice Agent (60 min) — **← CORE WOW**
Replace placeholder voice IDs, build agent config with IFS system prompt + XML voice tags, SessionView with `@11labs/react` useConversation hook, VoiceOrb audio-reactive animation, live transcript, Zustand state management.

### Phase 4: 3D Parts Map (90 min) — **← WHAT GOES VIRAL**
react-three-fiber Canvas with bloom post-processing, SelfNode with MeshDistortMaterial, PartOrb spheres with archetype colors, RelationshipThreads luminous lines, ParticleField background, golden-angle spiral layout, PartDetailPanel slide-in.

### Phase 5: Integration + State Flow (45 min)
Wire map → detail → session → map update flow, session persistence to DO, insight generation, self-leadership score computation and display.

### Phase 6: Ethics + Polish + Deploy (30 min) — **← LIVE URL FOR JUDGES**
Crisis detection (988 Lifeline modal), therapy disclaimer, deploy CF Pages + Workers.

---

## Time Allocation (6 days)

```
CLAUDE.md + plan        10%
Core build              30%
Map UI + polish         10%
Video + editing         35%
Social + submit         15%
```

---

## Demo Script (90 seconds)

### HOOK — 0 to 8 seconds (MOST IMPORTANT)
**ON CAMERA — DIRECT ADDRESS**
Sit in a quiet room. Look at camera. Say this in one breath:

> *"There's a voice in your head that tells you you're not enough. This is what happens when you finally talk back to it."*

**SCREEN RECORD — APP OPEN** (0:08)
Show the Parts map — a clean orbital UI with 3-4 named parts as nodes. Inner Critic (red), Perfectionist (orange), Inner Child (soft blue). Tap Inner Critic.

### THE WOW — 8 to 60 seconds (THIS IS THE PRODUCT)

**VOICE — APP FACILITATOR** (warm, calm ElevenLabs voice) (0:10)
> *"You're about to speak with your Inner Critic. Remember — you're not this part. You're the one talking to it. Whenever you're ready."*

**YOU SPEAK** — natural, slightly nervous (0:18)
> *"Hey. Why do you always tell me my work isn't good enough?"*

**INNER CRITIC RESPONDS** — DIFFERENT VOICE (clipped, slightly cold) (0:22)
The voice changes noticeably. Cooler, more precise. This is the part speaking.
> *"Because if I don't, you get complacent. And then you fail. And then everyone sees it."*

**YOU** — pause, then (0:30)
> *"What are you actually afraid of?"*

**INNER CRITIC** — slightly slower now (0:34)
> *"...that you'll find out you're not as capable as people think. That it was all luck."*

**FACILITATOR VOICE RETURNS** — gently (0:40)
> *"That's impostor syndrome, and it's a protector part. It's been working hard for a long time. Ask it what it would need to finally rest."*

**SCREEN — PARTS MAP UPDATES LIVE** (0:48)
A dotted line draws itself between Inner Critic and a node labeled "Fear of exposure." New insight badge appears: "Protector role confirmed." The map is visibly growing.

### THE NORTH STAR — 60 to 80 seconds (WHY IT MATTERS)

**BACK ON CAMERA** (1:00)
> *"That voice has been running my life for 20 years. I finally asked it what it was afraid of. It took 40 seconds."*

**SCREEN — SHOW MAP AFTER 3 WEEKS** (1:08)
Zoom out on a fuller map — 6 parts, relationship lines, Self node at center growing larger. Show the progress metric: "Self-leadership score: 7 sessions, 3 parts unburdened."

### CLOSER — 80 to 90 seconds (CTA)

**DIRECT TO CAMERA** (1:20)
> *"Built with ElevenLabs voice AI and Cloudflare. Every session lives in your own persistent space at the edge. Your parts are waiting. parts.app"*

---

## Pricing Model

- **Free** — 1 part, 3 sessions. Enough to have the first breakthrough.
- **$19/mo** — unlimited parts, unlimited sessions, full insight engine, export.
- **$49/mo** — therapist tier: share your parts map read-only with your human therapist.

**Key retention mechanic:** your parts map is unique to you and grows richer over time. Leaving means losing it.

---

## Ethical Requirements

**MUST include before launch:**

- Disclaimer: "Parts is not therapy and is not a replacement for professional mental health care."
- Crisis detection: if user expresses suicidal ideation or severe distress, facilitator immediately provides crisis resources (988 Lifeline, Crisis Text Line) and gently suggests professional help.
- Data privacy: all session data encrypted at rest in Durable Object. User can export or delete all data.
- No diagnosis: the app never diagnoses conditions. It facilitates self-exploration.

The IFS community will respect this. They're the launch audience.

---

## Repository Structure

```
Parts/
├── CLAUDE.md                          # This file — project source of truth
├── README.md                          # Public-facing project description
├── .env.example                       # Template for environment variables
├── .gitignore
│
├── app/                               # Next.js 15 App Router
│   ├── layout.tsx                     # Root layout + fonts + AuthProvider
│   ├── page.tsx                       # Landing page / main app
│   ├── globals.css                    # Tailwind + custom styles
│   ├── auth/
│   │   └── [...nextauth]/route.ts     # Auth.js Google OAuth
│   └── api/
│       ├── session/
│       │   ├── start/route.ts         # Start IFS session
│       │   └── end/route.ts           # End session, trigger summary
│       ├── parts/
│       │   ├── route.ts               # GET list, POST create
│       │   └── [id]/
│       │       ├── route.ts           # GET detail, PATCH update
│       │       └── speak/route.ts     # POST: generate part TTS response
│       └── insights/route.ts          # GET user insights
│
├── components/
│   ├── three/                         # 3D visualization (react-three-fiber)
│   │   ├── PartsMap3D.tsx             # Canvas + EffectComposer + Bloom + OrbitControls
│   │   ├── SelfNode.tsx               # Central Self sphere (MeshDistortMaterial)
│   │   ├── PartOrb.tsx                # Individual part sphere
│   │   ├── RelationshipThreads.tsx    # Luminous animated connections
│   │   └── ParticleField.tsx          # Background particles for depth
│   ├── providers/
│   │   └── AuthProvider.tsx           # Auth.js SessionProvider wrapper
│   ├── SessionView.tsx               # Active voice session UI
│   ├── VoiceOrb.tsx                  # Audio-reactive pulse animation
│   ├── TranscriptView.tsx            # Live session transcript
│   ├── PartDetailPanel.tsx           # Part info slide-in panel
│   ├── LanguageSelector.tsx          # EN/ES language picker
│   ├── OnboardingFlow.tsx            # Guided first session
│   ├── CrisisDetection.tsx           # Crisis keyword detection + resources
│   ├── Disclaimer.tsx                # Therapy disclaimer
│   └── SelfLeadershipScore.tsx       # Progress metric display
│
├── lib/
│   ├── types.ts                       # TypeScript interfaces (from data model above)
│   ├── elevenlabs.ts                  # ElevenLabs multi-voice agent config builder
│   ├── auth.ts                        # Auth.js configuration
│   ├── cloudflare.ts                  # DO client helpers
│   ├── voices.ts                      # Voice ID mappings for archetypes (multilingual)
│   ├── i18n.ts                        # EN/ES string dictionary
│   ├── orbital.ts                     # Golden-angle spiral 3D positioning math
│   └── store.ts                       # Zustand state stores
│
├── worker/                            # Cloudflare Worker
│   ├── index.ts                       # Main worker: auth, routing, WebSocket
│   ├── durable-object.ts             # UserPsyche Durable Object class
│   └── wrangler.toml                  # Cloudflare deployment config
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── tailwind.config.ts
```

---

## The One Thing That Must Work Perfectly on Video

The voice switch. When you're talking to the facilitator and then ask to speak with a part — the voice must change noticeably and immediately. That moment of hearing a different voice speak as your inner critic is the entire product in 2 seconds. If this is laggy or unclear, the video doesn't land. Everything else can be rough.

---

## Critical Invariants

- **Never expose API keys client-side** — all ElevenLabs and Cloudflare calls go through API routes or Workers
- **One Durable Object per user** — derived from Google OAuth ID, deterministic
- **Parts persist forever** — a part is never deleted, only archived
- **Session transcripts are immutable** — once a session ends, its transcript never changes
- **Voice consistency** — a part's voice ID never changes once assigned
- **Ethical guardrails always on** — crisis detection, disclaimers, no diagnosis
- **Self-leadership score is transparent** — users can see how it's calculated

---

**Last Updated:** March 27, 2026
**Status:** Architecture updated — r3f 3D map, multi-voice ElevenLabs, EN/ES, split-key DO storage. Ready to build.
**Deadline:** ~6 days (ElevenHacks #2 submission)
