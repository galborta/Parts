import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { primaryPartId } = await request.json();

  // For now, return the agent ID — the client connects directly to ElevenLabs
  return NextResponse.json({
    agentId: process.env.NEXT_PUBLIC_ELEVENLABS_FACILITATOR_AGENT_ID,
    primaryPartId,
  });
}
