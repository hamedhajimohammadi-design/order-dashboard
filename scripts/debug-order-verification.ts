
import 'dotenv/config';
import axios from 'axios';

const WC_URL = process.env.WC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const WC_CK = process.env.WC_CONSUMER_KEY;
const WC_CS = process.env.WC_CONSUMER_SECRET;

async function debugOrder(orderId: string) {
    console.log(`🔍 Debugging Order #${orderId}...`);

    try {
        // 1. Fetch Order
        console.log("   Fetching order from WooCommerce...");
        const orderRes = await axios.get(`${WC_URL}/wp-json/wc/v3/orders/${orderId}`, {
            params: { consumer_key: WC_CK, consumer_secret: WC_CS }
        });
        const order = orderRes.data;
        const customerId = order.customer_id;
        console.log(`   ✅ Order Found. Customer ID: ${customerId}`);

        if (!customerId) {
            console.log("   ❌ No Customer ID found on order.");
            return;
        }

        // 2. Fetch Customer
        console.log(`   Fetching customer #${customerId} from WooCommerce...`);
        const customerRes = await axios.get(`${WC_URL}/wp-json/wc/v3/customers/${customerId}`, {
            params: { consumer_key: WC_CK, consumer_secret: WC_CS, context: 'edit' }
        });
        const customer = customerRes.data;
        
        // 3. Analyze Meta
        console.log("   📊 Analyzing Customer Meta...");
        const meta = customer.meta_data || [];
        
        const level1 = meta.find((m: any) => m.key === '_mnsfpt_user_level_status_mnsfpt_level_1');
        const advanced = meta.find((m: any) => m.key === '_mnsfpt_user_level_status_advanced');
        const authMeta = meta.find((m: any) => m.key === '_mnsfpt_user_authenticate');

        console.log(`      - _mnsfpt_user_level_status_mnsfpt_level_1: ${level1 ? level1.value : 'MISSING'}`);
        console.log(`      - _mnsfpt_user_level_status_advanced: ${advanced ? advanced.value : 'MISSING'}`);
        
        let hasImage = false;
        let imageField = 'N/A';

        if (authMeta) {
            console.log("      - _mnsfpt_user_authenticate: FOUND");
            const data = authMeta.value;
            const fields = Array.isArray(data) ? data[0] : data;
            
            console.log("      - Auth Fields Content:", JSON.stringify(fields, null, 2));
            
            if (fields) {
                imageField = fields['mnsfpt_field_7_1'];
                if (imageField && imageField.length > 0) {
                    hasImage = true;
                }
            }
        } else {
            console.log("      - _mnsfpt_user_authenticate: MISSING");
        }

        console.log(`      - Image Field (mnsfpt_field_7_1): ${imageField}`);
        console.log(`      - Has Image: ${hasImage}`);

        // 4. Logic Check
        const isStatusVerified = level1 && level1.value === 'verified';
        const isVerified = isStatusVerified && hasImage;

        console.log("\n   🏁 Verification Result:");
        console.log(`      - Status Verified: ${isStatusVerified}`);
        console.log(`      - Image Present: ${hasImage}`);
        console.log(`      - FINAL RESULT (is_verified): ${isVerified}`);

    } catch (error) {
        console.error("   ❌ Error:", error instanceof Error ? error.message : error);
    }
}

// Run
debugOrder('5054362');
