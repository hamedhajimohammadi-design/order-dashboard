
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const orderId = 5053421;
    console.log(`Checking order ${orderId} in DB...`);

    const order = await prisma.order.findFirst({
        where: {
            OR: [
                { wp_order_id: BigInt(orderId) },
                { id: orderId }
            ]
        }
    });

    if (!order) {
        console.log("❌ Order NOT found in database.");
    } else {
        console.log("✅ Order found in DB:");
        console.log(`   ID: ${order.id}`);
        console.log(`   WP ID: ${order.wp_order_id}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   WP Status: ${order.wp_status}`);
        console.log(`   Order Date: ${order.order_date}`);
        console.log(`   Operator: ${order.operator_name}`);
        
        // Check if it meets the criteria for the supervisor list
        const CUTOFF_DATE = new Date('2025-12-31T00:00:00.000Z');
        console.log(`   Is after cutoff (${CUTOFF_DATE.toISOString()})? ${order.order_date >= CUTOFF_DATE}`);
    }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
