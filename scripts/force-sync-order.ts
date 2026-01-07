
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { syncOrderWithWooCommerce } from '../lib/sync-helper';

const prisma = new PrismaClient();

async function main() {
    const orderId = 5053421;
    console.log(`🚀 Force syncing order ${orderId}...`);

    const WC_URL = process.env.WC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
    const WC_CK = process.env.WC_CONSUMER_KEY;
    const WC_CS = process.env.WC_CONSUMER_SECRET;

    try {
        const res = await fetch(`${WC_URL}/wp-json/wc/v3/orders/${orderId}?consumer_key=${WC_CK}&consumer_secret=${WC_CS}`);
        if (!res.ok) {
            console.error(`❌ Failed to fetch from WC: ${res.status} ${res.statusText}`);
            return;
        }

        const wcOrder = await res.json();
        console.log(`✅ Fetched from WC. Status: ${wcOrder.status}, Date: ${wcOrder.date_created}`);

        const syncedOrder = await syncOrderWithWooCommerce(wcOrder);
        console.log(`✅ Synced to DB. ID: ${syncedOrder.id}, Status: ${syncedOrder.status}`);

    } catch (e) {
        console.error("Error:", e);
    }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
