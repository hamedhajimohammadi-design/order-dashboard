import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  try {
    const data = JSON.parse(fs.readFileSync('remote_data.json', 'utf8'));
    console.log(`Read ${data.users.length} users and ${data.orders.length} orders.`);

    // 1. Upsert Users
    for (const user of data.users) {
      // Handle BigInt serialization if needed (JSON might have stringified it)
      if (user.telegram_chat_id) user.telegram_chat_id = BigInt(user.telegram_chat_id);
      
      // Remove id from creation data to let local DB handle auto-increment if needed, 
      // BUT we want to preserve IDs for constraints. 
      // upsert is good.
      
      await prisma.user.upsert({
        where: { id: user.id },
        update: {
            ...user,
            telegram_chat_id: user.telegram_chat_id ? BigInt(user.telegram_chat_id) : null
        },
        create: {
            ...user,
            telegram_chat_id: user.telegram_chat_id ? BigInt(user.telegram_chat_id) : null
        },
      });
    }
    console.log('Users imported.');

    // 2. Upsert Orders
    for (const order of data.orders) {
        // Fix BigInts
        if (order.wp_order_id) order.wp_order_id = BigInt(order.wp_order_id);
        
        await prisma.order.upsert({
            where: { id: order.id },
            update: {
                 ...order,
                 wp_order_id: BigInt(order.wp_order_id)
            },
            create: {
                ...order,
                wp_order_id: BigInt(order.wp_order_id)
            },
        });
    }
    console.log('Orders imported.');

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
