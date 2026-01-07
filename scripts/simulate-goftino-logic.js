
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Simulating Goftino Webhook Logic...');
    
    // Mock Payload
    const body = {
        event: 'new_message',
        data: {
            chat_id: 'simulated_chat_10000',
            content: 'Please check order 10000 status',
            sender: { from: 'user' }
        }
    };

    const data = body.data || body;
    const chatId = data.chat_id;
    const content = data.content || '';
    const sender = data.sender ? data.sender.from : 'user';

    console.log('Content:', content);

    const orderMatch = content.match(/(\d{5,})/);
    if (orderMatch) {
         const orderIdStr = orderMatch[1];
         console.log('Found ID:', orderIdStr);
         const orderIdBig = BigInt(orderIdStr);

         const updated = await prisma.order.updateMany({
             where: { 
                 wp_order_id: orderIdBig, 
             },
             data: {
                 last_user_online: new Date(),
                 goftino_chat_id: chatId 
             }
         });
         
         console.log('Updated count:', updated.count);
    } else {
        console.log('No ID found.');
    }

    // Verify
    const order = await prisma.order.findFirst({
        where: { wp_order_id: BigInt(10000) }
    });
    console.log('----------------Verification----------------');
    console.log('Order:', order.wp_order_id.toString());
    console.log('Goftino Chat ID:', order.goftino_chat_id);
    console.log('Last User Online:', order.last_user_online);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

