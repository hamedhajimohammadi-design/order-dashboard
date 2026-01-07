import { NextResponse } from 'next/server';
import { ChatService } from '@/lib/chat-service';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('Goftino Webhook:', JSON.stringify(body));

        // Goftino structure: { event: 'new_message', data: { chat_id: '...', content: '...', ... } }
        // OR fallback to flat structure if used differently previously
        const event = body.event;
        const data = body.data || body; 

        // Extract consistent fields
        const chatId = data.chat_id || data.session_id || body.session_id;
        const content = data.content || data.text || body.text || body.message || '';
        const sender = data.sender ? data.sender.from : (data.from || 'user'); // 'operator' or 'user'

        // Ignore operator messages to avoid loops
        if (sender === 'operator') {
            return NextResponse.json({ status: 'ignored_operator' });
        }

        if (chatId) {
             let userId;
             // Try to link user if phone provided in user_data (custom logic)
             if (body.user_data && body.user_data.phone) {
                 const user = await prisma.user.findUnique({ where: { phone_number: body.user_data.phone }});
                 userId = user?.id;
             }

             // 1. Check for Order ID in content (e.g. "50576" or "#50576")
             const orderMatch = content.match(/(\d{5,})/);
             if (orderMatch) {
                 const orderIdStr = orderMatch[1];
                 const orderIdBig = BigInt(orderIdStr);

                 // Update Orders matching this ID
                 // Mark user as online on this order
                 const updated = await prisma.order.updateMany({
                     where: { 
                         wp_order_id: orderIdBig, 
                     },
                     data: {
                         last_user_online: new Date(),
                         goftino_chat_id: chatId // Link chat ID for future reference
                     }
                 });
                 if (updated.count > 0) {
                     console.log(`[Goftino] Order ${orderIdStr} matched. Updated online status.`);
                 }
             } else {
                 // 2. If no ID found, check if this chatId is already linked to active orders
                 // and update their online status
                 await prisma.order.updateMany({
                     where: { 
                         goftino_chat_id: chatId, 
                         status: { notIn: ['completed', 'cancelled', 'refunded', 'failed'] }
                     },
                     data: {
                         last_user_online: new Date()
                     }
                 });
             }

             // Save for chat history (optional/existing logic)
             const session = await ChatService.findOrCreateSession('goftino', chatId, userId);
             await ChatService.saveMessage(session.id, 'user', content);
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error('Goftino Error', e);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
