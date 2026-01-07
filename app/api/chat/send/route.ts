import { NextResponse } from 'next/server';
import { ChatService } from '@/lib/chat-service';
import { sendTelegramMessage } from '@/lib/telegram-bot';
import { sendGoftinoMessage } from '@/lib/goftino';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { sessionId, content, userId, platform } = await req.json();

    if (!content) {
        return NextResponse.json({ error: 'Missing content' }, { status: 400 });
    }

    let session;

    if (sessionId) {
        session = await prisma.chatSession.findUnique({ where: { id: sessionId }});
    } 
    else if (userId && platform) {
        const user = await prisma.user.findUnique({ where: { id: userId }});
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        let externalId;
        if (platform === 'telegram') externalId = user.telegram_chat_id ? String(user.telegram_chat_id) : null;
        
        if (!externalId) return NextResponse.json({ error: 'User has no linked ID for this platform' }, { status: 400 });

        session = await ChatService.findOrCreateSession(platform, externalId, userId);
    }

    if (!session) return NextResponse.json({ error: 'Session not found or created' }, { status: 404 });

    let providerResult;
    if (session.platform === 'telegram') {
        providerResult = await sendTelegramMessage(session.external_id, content);
    } else if (session.platform === 'goftino') {
        providerResult = await sendGoftinoMessage(session.external_id, content);
    }

    const message = await ChatService.saveMessage(session.id, 'admin', content);

    return NextResponse.json({ success: true, message, providerResult });
  } catch (error) {
    console.error('Send Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
