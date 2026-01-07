import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  // Update activity status
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        last_active_at: new Date(),
        is_online: true
      }
    });
  } catch (e) {
    console.error("Failed to update user activity", e);
  }

  return NextResponse.json({ 
    success: true, 
    data: {
      id: user.id,
      username: user.username,
      display_name: user.display_name || user.username,
      role: user.role
    } 
  });
}
