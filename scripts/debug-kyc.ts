import 'dotenv/config';
import axios from 'axios';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pgemshop.com";
const WC_CK = process.env.WC_CONSUMER_KEY!;
const WC_CS = process.env.WC_CONSUMER_SECRET!;
const WC_URL = siteUrl?.replace(/\/$/, ""); 

async function debugKYC() {
  console.log('🔍 Fetching last 10 orders to find a customer with full KYC...');
  
  try {
    const orderRes = await axios.get(`${WC_URL}/wp-json/wc/v3/orders`, {
      params: {
        consumer_key: WC_CK,
        consumer_secret: WC_CS,
        per_page: 10,
      }
    });

    for (const order of orderRes.data) {
        const customerId = order.customer_id;
        if (!customerId || customerId === 0) continue;

        try {
            const customerRes = await axios.get(`${WC_URL}/wp-json/wc/v3/customers/${customerId}`, {
                params: {
                    consumer_key: WC_CK,
                    consumer_secret: WC_CS,
                    context: 'edit'
                }
            });

            const customer = customerRes.data;
            const authMeta = customer.meta_data.find((m: any) => m.key === '_mnsfpt_user_authenticate');
            
            if (authMeta && authMeta.value) {
                const keys = Object.keys(authMeta.value);
                if (keys.length > 1) { 
                    console.log(`\n✅ Found Full KYC for Customer #${customerId} (Order #${order.id}):`);
                    console.log(JSON.stringify(authMeta.value, null, 2));
                    return; 
                }
            }
        } catch (e) {
            // ignore
        }
    }
    console.log("\n❌ No customers with full KYC data found in the last 10 orders.");

  } catch (error: any) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

debugKYC();
