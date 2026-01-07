
import 'dotenv/config';
import axios from 'axios';

const WC_URL = process.env.WC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const WC_CK = process.env.WC_CONSUMER_KEY;
const WC_CS = process.env.WC_CONSUMER_SECRET;

async function checkOrder(orderId) {
    console.log(`\n🔍 Checking Order #${orderId}...`);
    try {
        // 1. Get Order
        const orderRes = await axios.get(`${WC_URL}/wp-json/wc/v3/orders/${orderId}`, {
            params: { consumer_key: WC_CK, consumer_secret: WC_CS }
        });
        const order = orderRes.data;
        const customerId = order.customer_id;
        console.log(`   👤 Customer ID: ${customerId}`);
        console.log("   📦 Order Meta Keys:", order.meta_data.map(m => m.key));

        if (!customerId) {
            console.log("   ❌ No Customer ID found.");
            return;
        }

        // 2. Get Customer (WC)
        // const customerRes = await axios.get(`${WC_URL}/wp-json/wc/v3/customers/${customerId}`, {
        //     params: { consumer_key: WC_CK, consumer_secret: WC_CS }
        // });
        // const customer = customerRes.data;

        // 2. Try WP User Endpoint (Basic Auth might be needed, but let's try query params first or just see if it works)
        // Note: WC keys usually don't work for WP API directly unless configured.
        // Let's stick to WC API but try 'context=edit' which sometimes exposes more fields.
        
        const customerRes = await axios.get(`${WC_URL}/wp-json/wc/v3/customers/${customerId}`, {
            params: { 
                consumer_key: WC_CK, 
                consumer_secret: WC_CS,
                context: 'edit' // 👈 Try this
            }
        });
        const customer = customerRes.data;
        
        // 3. Check Meta
        const meta = customer.meta_data || [];
        console.log("   📋 All Meta Keys (context=edit):", meta.map(m => m.key));

        const level1 = meta.find(m => m.key === '_mnsfpt_user_level_status_mnsfpt_level_1');
        const advanced = meta.find(m => m.key === '_mnsfpt_user_level_status_advanced');
        const form1 = meta.find(m => m.key === '_mnsfpt_user_level_status_mnsfpt_form_1_initial');

        console.log(`   📋 Meta Data:`);
        console.log(`      - _mnsfpt_user_level_status_mnsfpt_level_1: ${level1 ? level1.value : 'N/A'}`);
        console.log(`      - _mnsfpt_user_level_status_advanced: ${advanced ? advanced.value : 'N/A'}`);
        console.log(`      - _mnsfpt_user_level_status_mnsfpt_form_1_initial: ${form1 ? form1.value : 'N/A'}`);

        // 4. Apply Logic
        const isVerified = meta.some(m => 
            (m.key === '_mnsfpt_user_level_status_mnsfpt_level_1' && m.value === 'verified') ||
            (m.key === '_mnsfpt_user_level_status_advanced' && m.value === 'verified')
        );

        console.log(`   ✅ Logic Result (isVerified): ${isVerified}`);

    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        if (error.response) console.error(`      Status: ${error.response.status}`);
    }
}

async function main() {
    await checkOrder(5054142); // Should be Verified
    await checkOrder(5054162); // Should be Not Verified
}

main();
