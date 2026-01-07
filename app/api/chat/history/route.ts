import { NextResponse } from 'next/server';
import { ChatService } from '@/lib/chat-service';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const sessionId = searchParams.get('sessionId');

  if (sessionId) {
      const messages = await ChatService.getSessionHistory(Number(sessionId));
      return NextResponse.json({ messages });
  }

  if (userId) {
      const sessions = await ChatService.getMessagesForUser(Number(userId));
      return NextResponse.json({ sessions });
  }
  
  return NextResponse.json({ error: 'Missing userId or sessionId' }, { status: 400 });
}
