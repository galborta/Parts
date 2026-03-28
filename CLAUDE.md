# Parts — One voice. One question. It gets to know you.

## What This Is

Parts is a voice AI for self-knowledge. Every day, one voice asks you one question. The question is never random — it's the next right move in a structured psychological progression based on your history. The more you use it, the more precisely it knows where to aim.

It gets harder over time. It gets more personal over time. That's the product.

**Built for ElevenHacks #2: Cloudflare × ElevenLabs**

---

## The Core Experience

One screen. One orb. One voice.

The voice asks a question. You answer out loud. The voice reflects what it heard in one sentence. Then it closes: *"Let that sit."*

That's a session. 3–5 minutes. Done.

The next session knows everything you said in every previous session. The questions build. After 10 sessions it starts naming patterns you haven't named yourself. After 30 sessions, it knows you.

---

## The Scientific Method (Why This Isn't Just a Journaling App)

Two evidence-based frameworks, combined:

### Motivational Interviewing (MI)
Developed by Miller & Rollnick. Hundreds of RCTs. The core insight: people don't change because someone told them to. They change when they hear themselves articulate their own reasons. The AI's job is to ask questions that draw out *your own* change talk — never to advise, diagnose, or instruct.

MI has a staged progression. The AI tracks which stage each user is in and generates questions accordingly.

### ACT — Acceptance & Commitment Therapy
The most evidence-based therapy of the last 20 years (SAMHSA listed). Its north star is **psychological flexibility** — the ability to be present, open, and do what matters even when it's hard.

ACT defines 6 measurable dimensions. The AI tracks all of them in the Durable Object and targets whichever is most neglected.

---

## The 4 Stages (MI)

The Durable Object tracks the user's current stage. Stage advances when behavioral thresholds are met (N sessions, engagement quality, pattern detection).

### Stage 1: Engage (Sessions 1–7)
Build safety. Ask about what's present. Learn the user's vocabulary and emotional register. Never probe — observe. Questions feel like a curious, unhurried friend.

> *"What's been taking up the most space in your mind lately?"*
> *"When you imagine feeling more at ease, what's the first thing that shifts?"*

### Stage 2: Focus (Sessions 8–20)
The AI has enough data. Start referencing what the user has actually said. Questions begin to feel targeted — slightly uncomfortable. They name patterns the user hasn't named.

> *"You've mentioned your work three times and never said what you actually want from it. What do you want?"*
> *"Last week you used the word 'trapped'. What would 'free' look like on a specific Tuesday morning?"*

### Stage 3: Evoke (Sessions 21–40)
The heart of MI. Ask questions designed to surface the user's own motivation for change — not motivation the AI provides. Listen for change talk. Target the gap between stated values and current life.

> *"If nothing changes in the next two years, what does that cost you?"*
> *"You've described what you're afraid of. What do you want instead — not the absence of fear, the actual thing you want?"*

### Stage 4: Integrate (Sessions 40+)
The user becomes the witness of their own growth. Questions invite them to look back, notice who they've become, consolidate what's changed.

> *"How is the way you're answering today different from how you would have answered three months ago?"*
> *"What do you know now that you wish you'd known when you started?"*

---

## The 6 ACT Dimensions (Tracked in DO)

The AI tracks engagement across all 6 dimensions. Whichever is most neglected across recent sessions gets targeted next.

| Dimension | Question Flavor |
|-----------|----------------|
| **Present moment** | Are you here or lost in past/future? |
| **Acceptance** | What are you avoiding feeling? |
| **Defusion** | Are you fused with a story about yourself? |
| **Self-as-context** | Who's watching all of this? |
| **Values clarity** | What actually matters to you? |
| **Committed action** | What are you actually doing about it? |

---

## How Each Question Is Generated

This is the algorithm. Every question is the result of this exact process — nothing is random.

```
1. Load DO: retrieve session history, detected patterns, current MI stage,
   ACT dimension scores, last 5 session summaries.

2. Find neglected ACT dimension: which of the 6 has been least addressed
   in the last 5 sessions?

3. Select question type: based on current MI stage, pick the appropriate
   question archetype (open question, values clarification, change talk evocation,
   forward projection, retrospective reflection, etc.)

4. Retrieve emotional anchors: 3 most emotionally significant phrases the
   user has said across all sessions (stored in DO as extracted patterns).

5. Generate the question:
   - Targets the neglected ACT dimension
   - Uses the right question type for the current stage
   - References something they actually said, if relevant
   - Is specific, not vague
   - Is under 25 words
   - Contains no advice, interpretation, or judgment
   - Should feel slightly uncomfortable — precise enough to land

6. The session:
   User answers (voice) →
   AI reflects in ≤15 words ("So what you're noticing is...") →
   One follow-up question OR closes: "Let that sit." →
   Session ends.

7. Post-session (Worker):
   - Transcribe and store full session in DO
   - Workers AI scores answer across 6 ACT dimensions
   - Extract new emotional patterns and recurring themes
   - Update stage if advancement thresholds met
   - Generate session summary (2–3 sentences, stored in DO)
   - Surface insight if new cross-session pattern detected
```

---

## The North Star

**Psychological flexibility** — ACT's measurable outcome. The user moves from being run by automatic patterns toward choosing how they respond to their inner experience. Measurable across the 6 dimensions. Visible in how they answer questions over time.

The app never tells the user they've achieved this. They notice it themselves when they answer a question and realize they would have answered it completely differently three months ago. That's the moment. That's the product.

---

## Tech Stack

```
Frontend        Next.js 15 (App Router, TypeScript) + Tailwind CSS
Animations      Framer Motion — ALL animations (page transitions, orb, session view)
Auth            Auth.js (NextAuth) — Sign in with Google → JWT
Edge Runtime    Cloudflare Workers (auth validation, routing, REST proxy to DO)
State           Cloudflare Durable Objects (1 per user — the user's entire psychological history)
AI Inference    Workers AI (question generation, session scoring, pattern extraction, summaries)
Voice           ElevenLabs Conversational AI — ONE voice, one agent, consistent across all sessions
Deployment      Cloudflare Pages (frontend) + Workers (backend + DO)
```

**No Three.js / react-three-fiber.** All visuals are Framer Motion.
**No multiple voices.** One voice, always. The consistency IS the relationship.
**Progress lives in Durable Object.** Not localStorage. The DO is the source of truth.

---

## Architecture

```
Browser (Next.js on CF Pages)
    │
    ├── Auth: Sign in with Google (Auth.js → JWT in httpOnly cookie)
    │
    ├── ElevenLabs Conversational AI (one agent, one voice, runs in browser)
    │   ├── System prompt injected at session start:
    │   │   - Current MI stage
    │   │   - Today's pre-generated question
    │   │   - Last 3 session summaries
    │   │   - Detected emotional patterns
    │   │   - User's name
    │   │   - Behavioral constraints (no advice, no diagnosis, reflect then close)
    │   └── Session ends → transcript sent to Worker
    │
    ├── REST API calls → CF Worker
    │       │
    │       ▼
    │   CF Worker validates JWT, routes to user's Durable Object
    │       │
    │       ▼
    │   Durable Object (1 per user — everything, forever)
    │   ├── meta           → UserMeta (stage, dimensions, language, onboarding)
    │   ├── parts          → (legacy: Part[] for IFS-adjacent features, not core to MVP)
    │   ├── session_index  → SessionIndexEntry[] (lightweight list)
    │   ├── session:{id}   → full session (transcript, scores, summary)
    │   ├── patterns       → ExtractedPattern[] (recurring themes, phrases)
    │   ├── insights       → Insight[] (cross-session observations)
    │   └── score          → { dimensions: DimensionScores, history: [] }
    │       │
    │       └── Workers AI:
    │           ├── /generate-question  (called before session, result cached in DO)
    │           ├── /score-session      (called after session ends)
    │           ├── /extract-patterns   (called after every 3rd session)
    │           └── /generate-insight   (called when new pattern threshold crossed)
    │
    └── UI (Framer Motion)
        ├── Landing page
        ├── Onboarding (3 steps)
        ├── Dashboard (session history, dimension scores, streak)
        ├── Session view (orb + voice + transcript)
        └── Insight view (pattern surfacing)
```

---

## Data Model

```typescript
// DO Storage: split keys to avoid 128KB limit per value
// 'meta'           → UserMeta
// 'session_index'  → SessionIndexEntry[]
// 'session:{id}'   → Session
// 'patterns'       → ExtractedPattern[]
// 'insights'       → Insight[]
// 'score'          → ScoreState

interface UserMeta {
  userId: string;
  email: string;
  name: string;
  language: 'en' | 'es';
  createdAt: string;
  onboarding: { completed: boolean; currentStep: number };

  // MI progression
  stage: 'engage' | 'focus' | 'evoke' | 'integrate';
  sessionCount: number;
  lastSessionDate: string;
  streak: number;

  // Pre-generated question for next session (generated post-session, ready to go)
  pendingQuestion: {
    text: string;
    targetDimension: ACTDimension;
    questionType: string;
    generatedAt: string;
  } | null;
}

type ACTDimension =
  | 'present_moment'
  | 'acceptance'
  | 'defusion'
  | 'self_as_context'
  | 'values_clarity'
  | 'committed_action';

interface ScoreState {
  dimensions: Record<ACTDimension, number>; // 0–100 each
  overall: number;
  history: { date: string; overall: number; dimensions: Record<ACTDimension, number> }[];
}

interface Session {
  id: string;
  startedAt: string;
  endedAt?: string;
  duration?: number;

  question: string;                    // The question that was asked
  targetDimension: ACTDimension;
  questionType: string;
  stage: string;                       // MI stage at time of session

  transcript: TranscriptEntry[];
  summary: string;                     // AI-generated, 2–3 sentences
  dimensionScores: Record<ACTDimension, number>; // scored post-session
  changeTalkDetected: boolean;         // MI: did user express change talk?
  newPatternsFound: string[];          // pattern IDs extracted this session
}

interface TranscriptEntry {
  speaker: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface SessionIndexEntry {
  id: string;
  startedAt: string;
  duration?: number;
  summary?: string;
  question: string;
}

interface ExtractedPattern {
  id: string;
  text: string;                        // e.g. "returns to theme of inadequacy"
  phrase?: string;                     // exact phrase: "not enough"
  occurrences: number;
  firstSeenAt: string;
  lastSeenAt: string;
  sessionIds: string[];
  dimension: ACTDimension;
}

interface Insight {
  id: string;
  text: string;                        // "You've used the word 'stuck' 11 times across 4 sessions."
  surfacedAt: string;
  acknowledged: boolean;
  patternIds: string[];
}
```

---

## Session Flow (Detailed)

### Before Session (on dashboard load)
1. Fetch `meta` from DO → check if `pendingQuestion` exists
2. If yes: use it. If no: call `/generate-question` via Workers AI (blocking, shown as loading)
3. Display question text on dashboard so user can see what's coming (optional — could hide for surprise)

### Session Start
1. POST `/api/session/start` → DO creates session record, returns `sessionId`
2. Call `/api/session/signed-url` → Worker calls ElevenLabs API to get signed URL
3. Signed URL request body includes system prompt with:
   - Today's question (verbatim — agent opens with this)
   - Last 3 session summaries
   - Top 3 emotional patterns
   - User's name
   - Stage-specific behavioral instructions
   - Hard constraints: reflect ≤15 words, one follow-up max, close with "Let that sit"
4. `useConversation({ signedUrl })` starts the ElevenLabs session

### During Session
- ElevenLabs agent asks the question, listens, reflects, optionally follows up, closes
- `onMessage` callback captures transcript entries → stored in local state
- `isSpeaking` drives the Framer Motion orb animation

### Session End
1. User taps "End" or agent closes naturally
2. `conversation.endSession()`
3. POST `/api/session/end` with transcript
4. Worker calls Workers AI: score transcript across 6 dimensions
5. Worker calls Workers AI: extract new patterns from this session
6. Worker calls Workers AI: generate 2–3 sentence summary
7. Worker updates DO: session complete, patterns merged, scores updated
8. Worker calls Workers AI: generate next session's question (stored as `pendingQuestion`)
9. Worker checks: any new insight threshold crossed? If yes, generate and store insight.
10. Client receives: `{ summary, dimensionDelta, newInsight? }`

---

## Workers AI Prompts

### /generate-question

```
You are generating ONE question for a voice-based self-knowledge session.

User context:
- Name: {name}
- Sessions completed: {sessionCount}
- Current MI stage: {stage} ({stageDescription})
- Target ACT dimension: {dimension} ({dimensionDescription})
- Question type: {questionType}
- Emotional patterns detected: {patterns}
- Last session summary: {lastSummary}
- Specific phrases to reference (if relevant): {anchorPhrases}

Generate ONE question that:
1. Targets the ACT dimension: {dimension}
2. Uses the question type: {questionType} (appropriate for {stage} stage)
3. References a specific thing they said only if it creates a precise, meaningful connection
4. Is under 25 words
5. Contains no advice, no interpretation, no judgment
6. Is specific enough to feel slightly uncomfortable — not a generic journaling prompt
7. A person should feel: "how did it know to ask that?"

Return ONLY the question. No preamble, no explanation.
```

### /score-session

```
Score this voice session transcript across 6 ACT dimensions.
Each score: 0 = not addressed, 1–3 = surface mention, 4–7 = genuine engagement, 8–10 = breakthrough moment.

Transcript:
{transcript}

Return JSON:
{
  "present_moment": number,
  "acceptance": number,
  "defusion": number,
  "self_as_context": number,
  "values_clarity": number,
  "committed_action": number,
  "change_talk_detected": boolean,
  "change_talk_phrases": string[]
}
```

### /extract-patterns

```
Analyze this transcript and the user's existing patterns. Extract any new recurring themes.

Existing patterns: {existingPatterns}
New transcript: {transcript}
Previous transcripts (last 5 summaries): {summaries}

Return JSON array of new patterns only (not existing ones):
[{
  "text": "short description of pattern",
  "phrase": "exact phrase if applicable",
  "dimension": "act_dimension"
}]

Return empty array if no new patterns. Max 2 new patterns per session.
```

### /generate-insight

```
Generate ONE insight observation for this user based on their detected patterns.
This will be shown to the user as a notable observation.

Patterns: {patterns}
Session count: {sessionCount}

Rules:
- Factual and specific, not interpretive ("You've used the word X 11 times" not "You seem to struggle with X")
- Under 30 words
- Should feel like something only someone who had listened carefully for weeks would notice
- Never diagnostic, never prescriptive

Return ONLY the insight text.
```

---

## UI — Session View

The session screen is one thing: a breathing orb in the center of a dark screen.

```
State: idle
- Orb: slow pulse, small, dark emerald
- Text: the question (centered, small, white/30)
- Button: "Begin" (bottom center)

State: connecting
- Orb: accelerating pulse
- Text: "..."

State: AI speaking
- Orb: large, bright, animated (Framer Motion spring scale + opacity)
- Text: last AI sentence as subtitle (white/25, italic)

State: user speaking (isSpeaking = false but connected)
- Orb: small, listening pulse
- Text: "listening" (barely visible)

State: session ended
- Orb: fades
- Session summary appears (slide up from bottom)
- If new insight: insight card appears above summary
```

All animations: **Framer Motion only**. No Three.js, no canvas.

The orb is a `div` with `border-radius: 50%` and a radial background. Animated with `motion.div` spring physics on scale and opacity. Simple, fast to build, looks great.

---

## Dashboard

```
Header: "Good morning, {name}" + streak + sign out
Today's question: shown upfront (glass card, large, readable)
  → "Begin" button
  → If already done today: "Come back tomorrow"

Progress (below the fold):
  - 6 dimension bars (ACT) — how each has evolved over time
  - Session history (last 10, each with date + one-line summary)
  - Insights (if any new: highlighted at top)

Stage indicator: "Engage · 4 sessions" → "Focus · 12 sessions" (subtle, bottom)
```

---

## API Routes

```
POST /api/session/start         Create session in DO, return sessionId
POST /api/session/end           Save transcript, trigger Workers AI pipeline
GET  /api/session/signed-url    Get ElevenLabs signed URL with injected context
GET  /api/meta                  User meta + pending question + scores
GET  /api/insights              User insights (unacknowledged first)
POST /api/insights/:id/ack      Acknowledge insight
GET  /api/history               Session index (for dashboard list)
```

---

## Environment Variables

```bash
# Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://parts.app

# ElevenLabs
ELEVENLABS_API_KEY=
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=   # ONE agent, one voice

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=

# App
NEXT_PUBLIC_APP_URL=https://parts.app
```

---

## Build Order

### 1. DO data model + API (45 min)
Update DO to new schema. Wire `meta`, `session`, `patterns`, `insights`, `score` keys.
All API routes stub out correctly. Progress lives in DO, not localStorage.

### 2. Workers AI question generation (30 min)
`/generate-question` endpoint. Takes DO state, returns question. Store as `pendingQuestion` in meta.
Test with hardcoded user state first.

### 3. ElevenLabs session with injected context (60 min) ← CORE
`/api/session/signed-url`: build system prompt dynamically from DO state.
Agent opens with the pre-generated question verbatim.
Session feels personal because it IS — it has your history in the prompt.

### 4. Post-session Workers AI pipeline (45 min)
Score → extract patterns → update scores → generate next question → check insight threshold.
All async after session ends. Dashboard refreshes to show delta.

### 5. Session view UI — the orb (45 min)
Framer Motion orb. One screen. Clean. Looks great in video.

### 6. Dashboard + history (30 min)
Today's question card. 6 dimension bars. Session history. Insight card.

### 7. Onboarding (20 min)
3 steps: name → language → first question preview. Then begin.

### 8. Deploy + ethics (20 min)
CF Pages + Workers. Crisis detection. Disclaimer. Live URL.

---

## The Video (90 seconds)

**Hook (0–6s): on camera**
> *"Most AI asks you to ask it questions. This one only asks you questions. And it gets harder every time."*

**Show (6–60s): screen record**
- Open app → today's question appears: *"You described your relationship with work last week but never said what you actually want from it. What do you want?"*
- Tap Begin → orb pulses to life
- User answers (genuine, slightly uncomfortable)
- AI reflects: *"So the wanting feels dangerous."*
- AI closes: *"Let that sit."*
- Session summary slides up: 3 sentences, precise
- Scroll to show: session 14 of 40. Dimension bars moving.

**The pattern moment (60–75s)**
Show insight surfacing:
> *"You've used the word 'deserve' 9 times across 6 sessions. Always about other people. Never about yourself."*

Pause. Let that land.

**Closer (75–90s): on camera**
> *"It knows what to ask because it remembers everything. Built on Cloudflare and ElevenLabs. The more you use it, the harder it gets. That's how it works."*

---

## Pricing

- **Free**: 7 sessions. Enough to reach Stage 2 and feel the shift.
- **$12/mo**: unlimited sessions, full pattern engine, insight history.
- **$29/mo**: export your full history + summaries as a readable document. Share with your therapist.

**Retention mechanic**: your pattern history and dimension trajectory are irreplaceable. You cannot recreate 40 sessions of context. Nobody cancels.

---

## Ethics

- Not therapy. Not a replacement for professional mental health care. Stated clearly.
- Crisis detection: if user expresses suicidal ideation → agent immediately provides 988 Lifeline, closes session, suggests professional help.
- No diagnosis. Ever. The AI observes patterns; it never labels the person.
- Data: all stored encrypted in Durable Object. User can delete everything.
- The questions are hard on purpose. That's the point. But the voice is never harsh.

---

## Critical Invariants

- **Progress lives in the Durable Object.** Never localStorage for anything important.
- **One voice.** Consistency across all sessions builds the relationship. Never change the voice mid-product.
- **The question is generated from the user's actual history.** Never a generic prompt bank.
- **Reflect, don't advise.** The AI says back what it heard. It never tells you what to do.
- **Sessions are immutable once ended.** Transcripts never change.
- **The question generation runs post-session** so it's ready before the next one. Never blocking the session start.

---

**Last Updated:** March 27, 2026
**Status:** New direction — one voice, MI+ACT methodology, DO as truth store, Framer Motion only.
**Deadline:** ~5 days (ElevenHacks #2)
