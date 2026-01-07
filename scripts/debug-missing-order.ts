
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const orderId = 5053421;
    console.log(`Checking order ${orderId}...`);

    const order = await prisma.order.findFirst({
        where: {
            OR: [
                { wp_order_id: BigInt(orderId) },
                { id: orderId } // Just in case
            ]
        },
        include: {
            user: true
        }
    });

    if (!order) {
        console.log("❌ Order NOT found in database.");
        
        // Check WC
        console.log("🌍 Checking WooCommerce...");
        const WC_URL = process.env.WC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
        const WC_CK = process.env.WC_CONSUMER_KEY;
        const WC_CS = process.env.WC_CONSUMER_SECRET;
        
        try {
            const res = await fetch(`${WC_URL}/wp-json/wc/v3/orders/${orderId}?consumer_key=${WC_CK}&consumer_secret=${WC_CS}`);
            if (res.ok) {
                const wcOrder = await res.json();
                console.log("✅ Order FOUND in WooCommerce!");
                console.log(`   Status: ${wcOrder.status}`);
                console.log(`   Date Created: ${wcOrder.date_created}`);
            } else {
                console.log(`❌ Order NOT found in WooCommerce either. Status: ${res.status}`);
            }
        } catch (e) {
            console.error("Error fetching from WC:", e);
        }

    } else {
        console.log("✅ Order found:");
        console.log(JSON.stringify(order, (key, value) => 
            typeof value === 'bigint' ? value.toString() : value
        , 2));
    }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
