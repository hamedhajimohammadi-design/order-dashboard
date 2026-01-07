
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function auditOrders() {
    console.log("🔍 Starting Order Audit...");

    // 1. Fetch 10 Zibal Orders with Verification File
    const zibalOrders = await prisma.order.findMany({
        where: { 
            payment_method: 'پرداخت امن زیبال',
            user: {
                verification_file: { not: null }
            }
        },
        take: 10,
        include: { user: true },
        orderBy: { created_at: 'desc' }
    });

    // 2. Fetch 10 Zarinpal Orders with Verification File
    const zarinpalOrders = await prisma.order.findMany({
        where: { 
            payment_method: 'پرداخت امن زرین پال',
            user: {
                verification_file: { not: null }
            }
        },
        take: 10,
        include: { user: true },
        orderBy: { created_at: 'desc' }
    });

    console.log(`\n📊 Found ${zibalOrders.length} Zibal orders and ${zarinpalOrders.length} Zarinpal orders with verification files.`);

    const allOrders = [...zibalOrders, ...zarinpalOrders];

    for (const order of allOrders) {
        console.log(`\n--------------------------------------------------`);
        console.log(`Order #${order.wp_order_id} (${order.payment_method})`);
        console.log(`   User: ${order.user?.display_name || order.user?.phone_number}`);
        console.log(`   Payment Card: ${order.payment_card_number || '❌ MISSING'}`);
        console.log(`   User Card: ${order.user?.card_number || '❌ MISSING'}`);
        
        const file = order.user?.verification_file;
        if (file) {
            const url = `https://pgemshop.com/wp-content/uploads/mnsfpt_uploads/${file}`;
            console.log(`   Verification File: ${file}`);
            
            try {
                // Test if file is accessible (HEAD request)
                // We use a fake user agent to mimic a browser
                const res = await axios.head(url, {
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    validateStatus: () => true 
                });
                
                if (res.status === 200) {
                    console.log(`   ✅ Image Accessible (200 OK)`);
                } else if (res.status === 403) {
                    console.log(`   ⚠️ Image Forbidden (403) - Likely Hotlink Protection (Proxy should fix this)`);
                } else {
                    console.log(`   ❌ Image Error (${res.status})`);
                }
            } catch (e) {
                console.log(`   ❌ Network Error checking image: ${e.message}`);
            }
        } else {
            console.log(`   ⚠️ No Verification File`);
        }
    }
}

auditOrders()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
