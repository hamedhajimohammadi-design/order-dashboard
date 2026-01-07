
import 'dotenv/config';
import axios from 'axios';

const WC_URL = process.env.WC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const WC_CK = process.env.WC_CONSUMER_KEY;
const WC_CS = process.env.WC_CONSUMER_SECRET;

async function inspectOrder(orderId) {
    console.log(`\n🔍 Inspecting Order #${orderId}...`);
    try {
        const res = await axios.get(`${WC_URL}/wp-json/wc/v3/orders/${orderId}`, {
            params: { consumer_key: WC_CK, consumer_secret: WC_CS }
        });
        const order = res.data;
        
        console.log("🆔 Order ID:", order.id);
        console.log("👤 Customer ID:", order.customer_id);
        
        // Check Order Meta
        console.log("\n📦 Order Meta Data Keys:");
        const orderMeta = order.meta_data || [];
        console.log(orderMeta.map(m => `${m.key}: ${JSON.stringify(m.value)}`).join('\n'));
        
        const orderLevel1 = orderMeta.find(m => m.key === '_mnsfpt_user_level_status_mnsfpt_level_1');
        console.log("   - _mnsfpt_user_level_status_mnsfpt_level_1:", orderLevel1 ? orderLevel1.value : 'NOT FOUND');

        // Check WP User Endpoint
        if (order.customer_id) {
            console.log("\n👤 WP User Endpoint:");
            try {
                const wpUserRes = await axios.get(`${WC_URL}/wp-json/wp/v2/users/${order.customer_id}`, {
                    params: { context: 'edit' },
                    headers: {
                        'Authorization': 'Basic ' + Buffer.from(`${WC_CK}:${WC_CS}`).toString('base64')
                    }
                });
                const wpUser = wpUserRes.data;
                console.log("   Keys:", Object.keys(wpUser));
                if (wpUser.meta) {
                    console.log("   Meta:", wpUser.meta);
                }
            } catch (e) {
                console.log("   ❌ WP API Error:", e.message);
            }
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

inspectOrder(5054230);
