
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Simulating Telegram Webhook Logic...');
    
    // Mock Payload
    // chatId is number in Telegram API
    const body = {
        update_id: 123456,
        message: {
            message_id: 999,
            from: { id: 112233, first_name: 'TeleUser' },
            chat: { id: 112233, type: 'private' },
            text: '/start 10000'
        }
    };

    const text = body.message.text;
    const chatId = body.message.chat.id; 
    console.log('Text:', text);

    const orderMatch = text.match(/(\d{5,})/);
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
                 telegram_chat_id: String(chatId) 
             }
         });
         
         console.log('Updated count:', updated.count);
    }

    // Verify
    const order = await prisma.order.findFirst({
        where: { wp_order_id: BigInt(10000) }
    });
    console.log('----------------Verification----------------');
    console.log('Order:', order.wp_order_id.toString());
    console.log('Telegram Chat ID:', order.telegram_chat_id ? order.telegram_chat_id.toString() : 'N/A');
    console.log('Last User Online:', order.last_user_online);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

