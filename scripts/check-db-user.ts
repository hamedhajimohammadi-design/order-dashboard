
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserInDB(orderId: string) {
    console.log(`🔍 Checking DB for Order #${orderId}...`);
    
    const order = await prisma.order.findFirst({
        where: { wp_order_id: parseInt(orderId) },
        include: { user: true }
    });

    if (!order) {
        console.log("❌ Order not found in DB.");
        return;
    }

    console.log(`✅ Order Found: ID ${order.id}, Status: ${order.status}`);
    console.log("👤 User Data:");
    console.log(order.user);
}

checkUserInDB('5054362');
