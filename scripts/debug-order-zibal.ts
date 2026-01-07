import 'dotenv/config';
import axios from 'axios';

const WC_URL = process.env.WC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const WC_CK = process.env.WC_CONSUMER_KEY;
const WC_CS = process.env.WC_CONSUMER_SECRET;

async function debugOrder(orderId: number) {
    console.log(`🔍 Fetching Order #${orderId} from WC...`);
    try {
        const res = await axios.get(`${WC_URL}/wp-json/wc/v3/orders/${orderId}`, {
            params: { consumer_key: WC_CK, consumer_secret: WC_CS }
        });
        const order = res.data;
        
        if (!order) {
            console.log("Order is null/undefined");
            return;
        }

        console.log(`ID: ${order.id}`);
        console.log(`Status: ${order.status}`);
        console.log(`Payment Method: ${order.payment_method}`);
        console.log(`Payment Method Title: ${order.payment_method_title}`);
        console.log(`Transaction ID: ${order.transaction_id}`);
        
        let trackId = order.transaction_id;

        console.log("--- Meta Data ---");
        if (order.meta_data && Array.isArray(order.meta_data)) {
            order.meta_data.forEach((m: any) => {
                if (m.key.includes('zibal') || m.key.includes('track') || m.key.includes('ref')) {
                     console.log(`[MATCH] ${m.key}: ${m.value}`);
                     if (!trackId && (m.key === 'transaction_id' || m.key === '_zibal_track_id' || m.key === 'wc_zibal_track_id')) {
                         trackId = m.value;
                     }
                } else {
                    // console.log(`${m.key}: ${m.value}`);
                }
            });
        }

        console.log(`\n🎯 Detected Track ID: ${trackId}`);
        
        const merchant = process.env.ZIBAL_MERCHANT || process.env.ZIBAL_API_TOKEN;
        console.log(`🔑 Using Merchant/Token: ${merchant ? merchant.substring(0, 5) + '...' : 'MISSING'}`);

        if (trackId && merchant) {
            console.log("🚀 Sending Inquiry to Zibal...");
            try {
                const zibalRes = await axios.post('https://gateway.zibal.ir/v1/inquiry', {
                    merchant: merchant,
                    trackId: trackId
                });
                
                console.log("--- Zibal Response ---");
                console.log(JSON.stringify(zibalRes.data, null, 2));
                
                if (zibalRes.data.cardNumber) {
                    console.log(`✅ Card Number Found: ${zibalRes.data.cardNumber}`);
                } else {
                    console.log("❌ Card Number NOT in response.");
                }

            } catch (zibalError: any) {
                console.error("❌ Zibal API Error:", zibalError.message);
                if (zibalError.response) {
                    console.error("Response Data:", zibalError.response.data);
                }
            }
        } else {
            console.log("⚠️ Cannot inquire: Missing Track ID or Merchant Token.");
        }

    } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : error);
    }
}

debugOrder(5053421);
