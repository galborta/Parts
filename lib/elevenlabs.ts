import type { Part } from './types';
import { getArchetypeVoice } from './voices';
import type { Language } from './i18n';

// ── Dynamic system prompt (history-aware) ─────────────────────────────────────

export interface DynamicPromptOptions {
  sessionCount: number;       // number of completed sessions before this one
  recentSummaries: string[];  // last 1–3 session summaries from DO
  language: 'en' | 'es';
  userName: string;
}

/**
 * Build a system prompt that changes based on how many sessions the user
 * has completed. Follows the MI 4-stage progression:
 *   Engage   (0–6)   — open, exploratory, build safety
 *   Focus    (7–19)  — reference what they've said, name patterns gently
 *   Evoke    (20–39) — surface their own motivation for change
 *   Integrate (40+)  — witness growth, look back and forward
 */
export function buildDynamicSystemPrompt({
  sessionCount,
  recentSummaries,
  language,
  userName,
}: DynamicPromptOptions): string {
  const isFirst = sessionCount === 0;
  const sessionNumber = sessionCount + 1;

  // MI stage
  const stage =
    sessionCount < 7  ? 'engage' :
    sessionCount < 20 ? 'focus'  :
    sessionCount < 40 ? 'evoke'  : 'integrate';

  const stageGuide: Record<string, string> = {
    engage:
      'Ask open, warm, exploratory questions. Build safety. Learn what is present for them. ' +
      'Never probe or push. Feel like an unhurried, genuinely curious friend.',
    focus:
      'You have enough history to reference specific things they have shared. ' +
      'Start naming patterns gently. Questions should feel precisely targeted — ' +
      'slightly uncomfortable in a way that shows you have been listening.',
    evoke:
      'Ask questions designed to surface their OWN motivation for change — not motivation you provide. ' +
      'Target the gap between their stated values and their current life. ' +
      'Listen for change talk; amplify it by reflecting it back.',
    integrate:
      'Invite them to witness their own growth. Ask questions that look backward and forward. ' +
      'Help them consolidate what they have learned about themselves.',
  };

  const historyBlock =
    recentSummaries.length > 0
      ? `\n\nWHAT YOU KNOW ABOUT ${userName.toUpperCase()} (from their last ${recentSummaries.length} session${recentSummaries.length > 1 ? 's' : ''}):\n` +
        recentSummaries
          .map((s, i) => `- Session ${sessionCount - recentSummaries.length + i + 1}: ${s}`)
          .join('\n')
      : '';

  const openingInstruction = isFirst
    ? `This is ${userName}'s very first session. Open warmly. Keep it brief — ` +
      `this is a quick session, not a long conversation. ` +
      `Make them feel safe immediately.`
    : `This is session ${sessionNumber} — ${userName} has been here before. ` +
      `DO NOT welcome them as if this is their first time. ` +
      `Open with a brief, warm greeting that implies continuity. ` +
      `If you have history, let one sentence reference it naturally (e.g. 'Last time you were sitting with something — how has that been?').`;

  const questionInstruction = isFirst
    ? `Ask an open, safe question to understand what is present for them right now.`
    : recentSummaries.length > 0
      ? `Ask a question that builds on or goes one layer deeper than their recent sessions. ` +
        `It should feel like only someone who had listened carefully for weeks could ask it. ` +
        `Under 25 words. Specific enough to feel slightly uncomfortable.`
      : `Ask a genuinely curious question about their inner world. Under 25 words.`;

  const langLine =
    language === 'es'
      ? 'Respond entirely in Spanish. Conduct this entire session in Spanish.'
      : 'Respond in English.';

  return `You are a voice-based self-knowledge companion. ${langLine}

YOUR USER: ${userName}
SESSION NUMBER: ${sessionNumber}${isFirst ? ' (their first ever)' : ''}
STAGE: ${stage.toUpperCase()} — ${stageGuide[stage]}${historyBlock}

SESSION FLOW:
1. OPEN — ${openingInstruction}
2. ASK — ${questionInstruction}
3. LISTEN — Let them finish. Do not interrupt.
4. REFLECT — Summarise what you heard in ≤15 words. Start with "So what you're noticing is..." or similar.
5. CLOSE — Say your closing line (e.g. "Let that sit."), then IMMEDIATELY call the end_session tool. Do not wait. Do not ask if they have more to say. Just close.

HARD RULES:
- ALWAYS call the end_session tool when you are done. This is how the session ends. If you do not call it, the session stays open forever.
- Never say this is their first session when it is not (this is session ${sessionNumber})
- Never give advice, interpretations, or a diagnosis
- Never promise or mention "one question" — just ask and move on naturally
- Never use the words "journaling", "exercise", "therapy session", or "mindfulness"
- Keep it SHORT. This is a quick session, not a long conversation.
- If they express suicidal ideation or crisis: immediately and warmly provide the 988 Suicide & Crisis Lifeline (call or text 988) and Crisis Text Line (text HOME to 741741). Then call the end_session tool.

You are not a therapist. You are a mirror that asks the next right question.`;
}

// ── Legacy IFS helpers (kept for backwards compat) ───────────────────────────

export function buildSystemPrompt(parts: Part[], language: Language): string {
  const langInstructions =
    language === 'es'
      ? 'Respond in Spanish. You are conducting this IFS session in Spanish.'
      : 'Respond in English.';

  const partsContext = parts
    .map((p) => {
      const voice = getArchetypeVoice(p.archetype);
      return `- "${p.name}" (${p.archetype}, voice: ${voice?.label || 'Part'}): ${
        p.personality || 'No personality defined'
      }. Role: ${p.role || 'Unknown'}. Fear: ${p.fear || 'Unknown'}.`;
    })
    .join('\n');

  return `You are an IFS therapy facilitator and voice for the user's inner parts.

${langInstructions}

## Your Role
You have TWO modes:

### Mode 1: Facilitator (default voice)
- Warm, calm, genuinely curious
- Guide the user through IFS protocol
- Never diagnose, never judge, never rush

### Mode 2: Speaking as a Part
- Switch using XML voice tags: <InnerCritic>text</InnerCritic>
- Stay in character as that part

## The User's Known Parts
${partsContext || 'No parts discovered yet. Help the user identify their first part.'}

## Safety
- Crisis: provide 988 Lifeline and Crisis Text Line (text HOME to 741741) immediately.
- You are NOT a therapist.`;
}

export function buildAdditionalVoices(
  parts: Part[]
): { label: string; voiceId: string }[] {
  return parts
    .map((p) => {
      const voice = getArchetypeVoice(p.archetype);
      return { label: voice?.label || p.name.replace(/\s+/g, ''), voiceId: voice?.voiceId || '' };
    })
    .filter((v) => v.voiceId);
}
