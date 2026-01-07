import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const o = await prisma.order.findUnique({ where: { wp_order_id: 50577 } });
console.log('Order 50577 last_user_online:', o ? o.last_user_online : 'NOT FOUND');
await prisma.();
