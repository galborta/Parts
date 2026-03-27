import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_FACILITATOR_AGENT_ID;
  if (!agentId) {
    return NextResponse.json({ error: 'Agent ID not configured' }, { status: 500 });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {}

  const language = body.language || 'en';

  // Get a signed URL from ElevenLabs
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
      language,
    });
  } catch (error) {
    console.error('[Parts] Error getting signed URL:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
