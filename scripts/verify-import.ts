import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.order.count();
  console.log(`Total orders in DB: ${count}`);

  const orders = await prisma.order.findMany({
    take: 5,
    orderBy: { order_date: 'desc' },
    select: { id: true, wp_order_id: true, order_date: true, status: true, user: { select: { phone_number: true } } }
  });
  console.log('Latest 5 orders:', JSON.stringify(orders, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
