
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orderId = 10000;
  const order = await prisma.order.findUnique({
      where: { wp_order_id: BigInt(orderId) }
  });
  console.log('Order:', orderId);
  console.log('Last User Online:', order ? order.last_user_online : 'Order not found');
  console.log('Goftino Chat ID:', order ? order.goftino_chat_id : 'N/A');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

