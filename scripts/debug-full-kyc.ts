
import 'dotenv/config';
import axios from 'axios';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pgemshop.com";
const WC_CK = process.env.WC_CONSUMER_KEY!;
const WC_CS = process.env.WC_CONSUMER_SECRET!;
const WC_URL = siteUrl?.replace(/\/$/, ""); 

const ZIBAL_MERCHANT = process.env.ZIBAL_MERCHANT;
const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID;

async function debugFullKYC() {
  console.log('🔍 Starting Full KYC & Payment Debug for last 10 orders...');
  console.log(`Gateway Config: Zibal=${ZIBAL_MERCHANT ? 'OK' : 'MISSING'}, Zarinpal=${ZARINPAL_MERCHANT_ID ? 'OK' : 'MISSING'}`);

  try {
    const orderRes = await axios.get(`${WC_URL}/wp-json/wc/v3/orders`, {
      params: {
        consumer_key: WC_CK,
        consumer_secret: WC_CS,
        per_page: 10,
      }
    });

    for (const order of orderRes.data) {
        console.log(`\n--------------------------------------------------`);
        console.log(`📦 Order #${order.id} | Status: ${order.status} | Total: ${order.total} ${order.currency}`);
        
        // 1. Check Customer KYC
        const customerId = order.customer_id;
        if (customerId && customerId !== 0) {
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
                    const data = authMeta.value;
                    const fields = Array.isArray(data) ? data[0] : data;
                    console.log(`👤 Customer #${customerId} KYC Data:`);
                    console.log(`   - Real Name: ${fields['mnsfpt_field_1_1'] || 'N/A'}`);
                    console.log(`   - National Code: ${fields['mnsfpt_field_2_1'] || 'N/A'}`);
                    console.log(`   - Card Number: ${fields['mnsfpt_field_12_1'] || 'N/A'}`);
                    console.log(`   - Bank: ${fields['mnsfpt_field_4_1'] || 'N/A'}`);
                } else {
                    console.log(`👤 Customer #${customerId}: No KYC Metadata found.`);
                }
            } catch (e: any) {
                console.log(`👤 Customer #${customerId}: Error fetching data - ${e.message}`);
            }
        } else {
            console.log(`👤 Customer: Guest (No ID)`);
        }

        // 2. Check Payment Card
        const method = order.payment_method;
        console.log(`💳 Payment Method: ${method}`);
        
        if (method === 'zibal' || method === 'WC_Zibal') {
            const trackIdMeta = order.meta_data.find((m: any) => m.key === '_zibal_track_id' || m.key === 'transaction_id');
            const trackId = trackIdMeta ? trackIdMeta.value : null;
            console.log(`   - Track ID: ${trackId || 'Not Found'}`);

            if (trackId && ZIBAL_MERCHANT) {
                try {
                    const res = await axios.post('https://gateway.zibal.ir/v1/inquiry', {
                        merchant: ZIBAL_MERCHANT,
                        trackId: trackId
                    });
                    if (res.data && res.data.result === 100) {
                        console.log(`   ✅ Zibal Inquiry Success: Card=${res.data.cardNumber}`);
                    } else {
                        console.log(`   ❌ Zibal Inquiry Failed: Result=${res.data.result}, Message=${res.data.message}`);
                    }
                } catch (e: any) {
                    console.log(`   ❌ Zibal API Error: ${e.message}`);
                }
            }
        } else if (method === 'WC_ZPal') {
            const authMeta = order.meta_data.find((m: any) => m.key === '_zarinpal_authority');
            const authority = authMeta ? authMeta.value : null;
            console.log(`   - Authority: ${authority || 'Not Found'}`);

            if (authority && ZARINPAL_MERCHANT_ID) {
                try {
                    const amount = Math.round(parseFloat(order.total) * 10);
                    const amountRial = order.currency === 'IRT' ? amount : parseFloat(order.total);
                    
                    const res = await axios.post('https://api.zarinpal.com/pg/v4/payment/verify.json', {
                        merchant_id: ZARINPAL_MERCHANT_ID,
                        amount: amountRial,
                        authority: authority
                    });
                    
                    if (res.data && res.data.data && res.data.data.card_pan) {
                        console.log(`   ✅ Zarinpal Verify Success: Card=${res.data.data.card_pan}`);
                    } else {
                        console.log(`   ⚠️ Zarinpal Verify Response:`, JSON.stringify(res.data));
                    }
                } catch (e: any) {
                    if (e.response && e.response.data) {
                         console.log(`   ❌ Zarinpal API Error:`, JSON.stringify(e.response.data));
                    } else {
                        console.log(`   ❌ Zarinpal API Error: ${e.message}`);
                    }
                }
            }
        } else {
            console.log(`   - Skipping gateway check for ${method}`);
        }
    }

  } catch (error: any) {
    console.error('Error fetching orders:', error.response ? error.response.data : error.message);
  }
}

debugFullKYC();
