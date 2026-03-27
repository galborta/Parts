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
Animations      Framer Motion (orbital parts map, spring physics, gestures)
Auth            Auth.js (NextAuth) — Sign in with Google → JWT
Edge Runtime    Cloudflare Workers (auth validation, routing, WebSocket upgrade)
State           Cloudflare Durable Objects (1 per user — persistent psyche)
Vector Search   Cloudflare Vectorize (semantic memory over session history)
AI Inference    Cloudflare Workers AI (pattern detection, insight generation)
Voice Agent     ElevenLabs Conversational AI (real-time facilitator voice)
Part Voices     ElevenLabs TTS (unique pre-assigned voice per part)
Deployment      Cloudflare Pages (frontend) + Workers (backend)
Repo            github.com/galborta/Parts
```

---

## Architecture

```
Browser (Next.js on CF Pages)
    │
    ├── Auth: Sign in with Google (Auth.js → JWT)
    │
    ├── WebSocket connection to CF Worker
    │       │
    │       ▼
    │   CF Worker validates JWT, routes to user's Durable Object
    │       │
    │       ▼
    │   Durable Object (1 per user — THE persistent psyche)
    │   ├── parts[ ] — name, voiceId, role, fear, dialogue history
    │   ├── sessions[ ] — transcripts, insights, timestamps
    │   ├── relationships — which parts protect which exiles
    │   └── selfLeadershipScore — the measurable north star
    │       │
    │       ├── → Vectorize (embed session transcripts, retrieve on next session)
    │       ├── → Workers AI (pattern detection: "You've mentioned your father 9 times across 3 parts")
    │       ├── → ElevenLabs Conversational AI (facilitator voice, real-time dialogue)
    │       └── → ElevenLabs TTS (part voices — unique per part, streamed)
    │
    └── Parts Map UI (Framer Motion orbital visualization)
        ├── Clickable orbs for each part
        ├── Relationship lines between parts
        ├── Self node at center (grows as Self-leadership increases)
        └── Insight badges on new discoveries
```

### The Architecture Insight for Judges

One Durable Object per user IS the IFS model in code. The user's psyche is a persistent, stateful, always-addressable entity at the edge. It holds their parts, remembers every conversation, and is alive forever. That's not a metaphor — it's genuinely the right primitive for this problem.

---

## Voice Architecture (The Key Technical Decision)

### The Voice Switch — This Is the Entire Product

When you're talking to the facilitator and ask to speak with a part, the voice must change noticeably and immediately. That moment of hearing a different voice speak as your inner critic is the entire product in 2 seconds.

### Implementation: Facilitator = Conversational AI, Parts = TTS Streaming

- **Facilitator:** ElevenLabs Conversational AI agent. Warm, calm, guides the session. Always the same voice. This is a real-time conversational agent — it listens, responds, adapts.

- **Parts:** ElevenLabs TTS streaming. When the facilitator "hands off" to a part, the Durable Object generates the part's response (via Workers AI, using the part's personality profile and dialogue history), then streams it as speech using that part's assigned ElevenLabs voice ID.

- **The switch:** User speaks → audio goes to Conversational AI facilitator → facilitator decides it's time to let the part speak → sends signal to client → client pauses Conversational AI → Durable Object generates part response → TTS streams the response in the part's voice → part finishes → Conversational AI resumes.

This is simpler than running multiple Conversational AI agents and avoids the WebSocket-switching complexity.

### 6 Preset Part Voices (Hackathon)

Pick 6 archetypal voices from ElevenLabs' voice library. Don't do custom cloning for the hackathon.

| Archetype | Voice Character | Example Voice |
|-----------|----------------|---------------|
| Inner Critic | Clipped, precise, slightly cold | Male, mature, authoritative |
| Perfectionist | Fast, anxious, detail-oriented | Female, sharp, energetic |
| Inner Child | Soft, small, vulnerable | Young-sounding, gentle |
| Protector | Strong, firm, defensive | Deep male, commanding |
| Pleaser | Warm, eager, slightly desperate | Female, bright, accommodating |
| Exile (wounded) | Quiet, fragile, hesitant | Whispered, slow, trembling |

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

### Core: Framer Motion Orbital Visualization

- Parts rendered as **softly glowing orbs** in orbital layout around a central **Self** node
- Each part-orb has a color based on archetype (warm = protectors, cool = exiles, neutral = managers)
- **Relationship lines** draw themselves between connected parts (protector → exile)
- **Self node grows** as selfLeadershipScore increases
- Tap a part to see its profile, history, start a session with it
- New parts animate in with spring physics
- Insight badges pulse on orbs when new pattern detected

### Animation Library

```
framer-motion for:
  - Orbital layout with spring physics
  - AnimatePresence for adding/removing parts
  - Drag gestures (users can rearrange their map)
  - layoutId for smooth transitions between map view and part detail
  - Animated relationship lines (SVG path drawing)
```

### Visual Targets for Video

The parts map is what people screenshot and share. It must look beautiful:
- Dark background, glowing orbs with soft shadows
- Smooth orbital motion (not jerky)
- Lines that draw themselves when relationships are discovered
- Insight badges that pulse with a gentle glow
- Self node at center with a distinct radiance

---

## API Routes (Next.js)

```
/api/auth/[...nextauth]    Auth.js Google OAuth handlers
/api/session/start         Start new session (connects to DO, gets facilitator ready)
/api/session/end           End session (triggers summary, insight generation)
/api/parts                 GET: list user's parts. POST: create new part
/api/parts/[id]            GET: part detail. PATCH: update part
/api/parts/[id]/speak      POST: generate part's TTS response (via DO → Workers AI → ElevenLabs TTS)
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

1. **CLAUDE.md written** ← this file. Do this before any code.

2. **GitHub repo initialized, .env.example, wrangler.toml** (15 min)

3. **Durable Object schema: user → parts[] → sessions[]** (30 min)
   The data model IS the psychology model. Get this right first.

4. **Worker that creates a DO per user and persists a part** (30 min)

5. **Auth layer: Sign in with Google via Auth.js** (45 min)

6. **ElevenLabs Conversational AI session — facilitator voice live** (30 min)
   **← CORE WOW**

7. **Part voice assignment — create a part, assign an ElevenLabs voice ID** (20 min)

8. **Voice switching — facilitator → part → facilitator** (60 min)
   The technical crux. Session passes context about which part is "speaking" and ElevenLabs switches voice.

9. **Parts map UI — orbital/node visualization, parts as clickable orbs** (90 min)
   **← WHAT GOES VIRAL**

10. **Vectorize integration — embed session transcript, retrieve on next session** (45 min)

11. **Insight surfacing — "You've mentioned your father 9 times across 3 parts"** (30 min)

12. **Self-leadership score — simple metric, visible in UI** (20 min)

13. **Deploy to Cloudflare Workers + Pages via Wrangler** (30 min)
    **← LIVE URL FOR JUDGES**

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
│   ├── PartsMap.tsx                   # Orbital visualization (Framer Motion)
│   ├── PartOrb.tsx                    # Individual part node
│   ├── RelationshipLine.tsx           # Animated SVG connections
│   ├── SelfNode.tsx                   # Central Self indicator
│   ├── SessionView.tsx               # Active session UI
│   ├── FacilitatorPanel.tsx           # Facilitator voice + controls
│   ├── TranscriptView.tsx            # Live session transcript
│   ├── InsightBadge.tsx              # Pulsing insight notification
│   ├── AuthButton.tsx                # Sign in with Google
│   └── OnboardingFlow.tsx            # Guided first session
│
├── lib/
│   ├── types.ts                       # TypeScript interfaces (from data model above)
│   ├── elevenlabs.ts                  # ElevenLabs Conversational AI + TTS helpers
│   ├── auth.ts                        # Auth.js configuration
│   ├── cloudflare.ts                  # DO client helpers
│   └── voices.ts                      # Voice ID mappings for archetypes
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
**Status:** Architecture defined — ready to build
**Deadline:** ~6 days (ElevenHacks #2 submission)
