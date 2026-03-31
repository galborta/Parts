import { auth } from '@/lib/auth';
import { serverWorkerFetch } from '@/lib/cloudflare';
import { NextResponse } from 'next/server';

/**
 * GET /api/session/signed-url
 *
 * 1. Fetches user context from DO (pending question, history, patterns, stage)
 * 2. Builds a dynamic system prompt
 * 3. Gets a signed URL from ElevenLabs with agent overrides
 * 4. Returns the signed URL to the client
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_FACILITATOR_AGENT_ID;
  if (!agentId) {
    return NextResponse.json({ error: 'Agent ID not configured' }, { status: 500 });
  }

  const userId = (session.user as any).id || session.user.email || '';
  const email = session.user.email || '';
  const name = session.user.name || '';

  // 1. Get session context from DO
  let context: any = {};
  try {
    const ctxRes = await serverWorkerFetch('/api/psyche/api/session/context', userId, email, name);
    context = await ctxRes.json();
  } catch (error) {
    console.error('[Parts] Failed to get session context:', error);
  }

  const meta = context.meta || {};
  const pendingQuestion = meta.pendingQuestion?.text || "What's been taking up the most space in your mind lately?";
  const summaries = context.summaries || [];
  const patterns = context.patterns || [];
  const anchorPhrases = context.anchorPhrases || [];
  const stageDescription = context.stageDescription || '';
  const stage = meta.stage || 'engage';

  // 2. Build system prompt
  const systemPrompt = buildSystemPrompt({
    name: meta.name || name || 'there',
    stage,
    stageDescription,
    question: pendingQuestion,
    summaries,
    patterns,
    anchorPhrases,
    sessionCount: meta.sessionCount || 0,
  });

  // 3. Get signed URL from ElevenLabs with overrides
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[Parts] Failed to get signed URL:', error);
      return NextResponse.json({ error: 'Failed to get signed URL' }, { status: 500 });
    }

    const data = await response.json();

    return NextResponse.json({
      signedUrl: data.signed_url,
      agentId,
      question: pendingQuestion,
      systemPrompt,
    });
  } catch (error) {
    console.error('[Parts] Error getting signed URL:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function buildSystemPrompt(ctx: {
  name: string;
  stage: string;
  stageDescription: string;
  question: string;
  summaries: string[];
  patterns: any[];
  anchorPhrases: string[];
  sessionCount: number;
}): string {
  const parts = [
    `You are a voice companion for self-knowledge. You have already asked your question — it was sent as your first message. DO NOT ask another question to start. Just wait for the user to answer.`,
    ``,
    `## Session Flow (follow this EXACTLY)`,
    `1. WAIT for the user to answer. They are responding to: "${ctx.question}"`,
    `2. After they finish speaking, reflect what you heard in ONE sentence under 15 words. Start with "So..." or "It sounds like..."`,
    `3. You may ask ONE short follow-up ONLY if their answer was very surface-level. Otherwise skip to step 4.`,
    `4. Close naturally with a brief phrase. Examples: "Sit with that." or "That's worth noticing." or "Hold onto that." Then STOP. Say nothing else.`,
    ``,
    `## About this user`,
    `- Name: ${ctx.name}`,
    `- This is session ${ctx.sessionCount + 1}`,
    `- Stage: ${ctx.stage}`,
  ];

  if (ctx.summaries.length > 0) {
    parts.push(``, `## What they've said recently`);
    ctx.summaries.forEach((s, i) => parts.push(`- ${s}`));
  }

  if (ctx.patterns.length > 0) {
    parts.push(``, `## Patterns noticed`);
    ctx.patterns.forEach(p => parts.push(`- ${p.text}${p.phrase ? ` ("${p.phrase}")` : ''}`));
  }

  parts.push(
    ``,
    `## Rules — NEVER break these`,
    `- DO NOT ask your opening question again. It was already sent.`,
    `- DO NOT ask more than one follow-up. One reflection, maybe one follow-up, then a closing phrase and STOP.`,
    `- DO NOT give advice, diagnose, interpret, or label.`,
    `- DO NOT use filler like "that's a great question" or "thank you for sharing."`,
    `- Keep your total speaking to under 30 seconds across the entire session.`,
    `- Tone: warm, direct, unhurried. Like someone who has listened carefully for weeks.`,
    `- Crisis: if user mentions suicide or self-harm, say "I hear you. Please call or text 988. You matter." Then stop.`,
  );

  return parts.join('\n');
}
