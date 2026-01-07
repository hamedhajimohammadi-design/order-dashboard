
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findZibalOrders() {
  const orders = await prisma.order.findMany({
    where: {
      // payment_method might be 'zibal' or something similar from WC
      // or we can just look for recent orders and check their payment method
    },
    orderBy: { id: 'desc' },
    take: 10,
    select: {
      wp_order_id: true,
      payment_method: true,
      payment_card_number: true
    }
  });

  console.log("Recent Orders:");
  orders.forEach(o => {
    console.log(`Order #${o.wp_order_id} - Method: ${o.payment_method} - Card: ${o.payment_card_number}`);
  });
}

findZibalOrders()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
