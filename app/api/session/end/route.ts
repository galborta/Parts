import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId, transcript } = await request.json();

  // TODO: Store transcript in DO, generate summary via Workers AI
  return NextResponse.json({ success: true, sessionId });
}
