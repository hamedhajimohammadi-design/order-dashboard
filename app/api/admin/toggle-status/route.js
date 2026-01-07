import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Check if body has userId (Supervisor override)
    let targetUserId = currentUser.id;
    let forceStatus = null;

    try {
        const body = await req.json();
        if (body && body.userId) {
            // Only supervisor/admin can toggle others
            if (currentUser.role !== 'admin' && currentUser.role !== 'supervisor') {
                return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
            }
            targetUserId = body.userId;
            forceStatus = body.forceStatus;
        }
    } catch (e) {
        // Body might be empty if called without args, which is fine for self-toggle
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });

    if (!user) return NextResponse.json({ success: false, message: "User not found" });

    // Determine new status: if forceStatus is provided use it, otherwise toggle
    const newIsOnline = forceStatus !== undefined ? forceStatus : !user.is_online;

    if (!newIsOnline) {
      // 🛑 Going Offline
      // Calculate session time if they were online
      let sessionSeconds = 0;
      if (user.is_online && user.last_active_at) {
          sessionSeconds = Math.floor((Date.now() - new Date(user.last_active_at).getTime()) / 1000);
      }
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          is_online: false,
          worked_seconds_today: { increment: sessionSeconds > 0 ? sessionSeconds : 0 },
          last_active_at: null
        }
      });
    } else {
      // 🟢 Going Online
      await prisma.user.update({
        where: { id: user.id },
        data: {
          is_online: true,
          last_active_at: new Date()
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}