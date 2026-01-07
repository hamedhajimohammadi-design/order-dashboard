import { prisma } from '@/lib/prisma';

export const ChatService = {
  async findOrCreateSession(platform: 'telegram' | 'goftino', externalId: string, userId?: number) {
    let session = await prisma.chatSession.findUnique({
      where: {
        platform_external_id: {
          platform,
          external_id: externalId
        }
      }
    });

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          platform,
          external_id: externalId,
          user_id: userId,
          status: 'active'
        }
      });
    } else {
      if (userId && !session.user_id) {
        session = await prisma.chatSession.update({
          where: { id: session.id },
          data: { user_id: userId }
        });
      }
      if (session.status !== 'active') {
          session = await prisma.chatSession.update({
            where: { id: session.id },
            data: { status: 'active' }
          });
      }
    }
    return session;
  },

  async saveMessage(sessionId: number, sender: 'user' | 'admin' | 'system', content: string) {
    const message = await prisma.chatMessage.create({
      data: {
        session_id: sessionId,
        sender,
        content
      }
    });
    
    const session = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { 
          last_message_at: new Date(),
          status: 'active'
      }
    });

    if (sender === 'user' && session.user_id) {
        await prisma.user.update({
            where: { id: session.user_id },
            data: { 
                last_active_at: new Date(),
                is_online: true 
            }
        });
    }

    return message;
  },
  
  async getSessionHistory(sessionId: number) {
      return await prisma.chatMessage.findMany({
          where: { session_id: sessionId },
          orderBy: { created_at: 'asc' }
      });
  },

  async getMessagesForUser(userId: number) {
    const sessions = await prisma.chatSession.findMany({
        where: { user_id: userId },
        include: {
            messages: {
                orderBy: { created_at: 'asc' }
            }
        }
    });
    return sessions;
  }
};
