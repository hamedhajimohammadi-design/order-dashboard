import { prisma } from '@/lib/prisma';

const SESSION_TIMEOUT_MINUTES = 60;

// Helper to find user by phone (simple wrapper)
async function findUserByPhone(phone: string) {
    return prisma.user.findUnique({ where: { phone_number: phone } });
}

export async function getOrCreateSession(externalId: string, userPhone?: string) {
  const platform = 'goftino'; 

  let session = await prisma.chatSession.findUnique({
    where: {
        platform_external_id: {
            platform,
            external_id: externalId
        }
    },
    include: { user: true }
  });

  if (!session) {
    let userId: number | undefined;
    if (userPhone) {
        const u = await findUserByPhone(userPhone);
        if (u) userId = u.id;
    }

    session = await prisma.chatSession.create({
      data: {
        platform,
        external_id: externalId,
        user_id: userId,
        status: 'IDLE', 
        context_data: {}, 
        last_message_at: new Date()
      },
      include: { user: true }
    });
  } else {
    // Check timeout
    const lastMessageAt = session.last_message_at ? new Date(session.last_message_at).getTime() : 0;
    const now = new Date().getTime();
    const diffMinutes = (now - lastMessageAt) / (1000 * 60);

    if (diffMinutes > SESSION_TIMEOUT_MINUTES) {
      session = await prisma.chatSession.update({
        where: { id: session.id },
        data: {
          status: 'IDLE',
          context_data: {},
          last_message_at: new Date()
        },
        include: { user: true }
      });
    } else {
        session = await prisma.chatSession.update({
            where: { id: session.id },
            data: { last_message_at: new Date() },
            include: { user: true }
        });
    }
  }

  return session;
}

export async function updateSession(externalId: string, data: any) {
  const platform = 'goftino';
  return await prisma.chatSession.update({
    where: {
        platform_external_id: {
            platform,
            external_id: externalId
        }
    },
    data: {
        ...data,
        last_message_at: new Date()
    },
    include: { user: true }
  });
}

export async function setSessionUser(externalId: string, phone: string) {
    let u = await findUserByPhone(phone);
    if (!u) {
        u = await prisma.user.create({
            data: {
                phone_number: phone,
                role: 'customer'
            }
        });
    }
    
    return await prisma.chatSession.update({
        where: {
            platform_external_id: {
                platform: 'goftino',
                external_id: externalId
            }
        },
        data: {
            user_id: u.id
        },
        include: { user: true }
    });
}
