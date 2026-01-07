
import 'dotenv/config';
import axios from 'axios';

const WC_URL = process.env.WC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const WC_CK = process.env.WC_CONSUMER_KEY;
const WC_CS = process.env.WC_CONSUMER_SECRET;

async function listOrders() {
    console.log(`🔍 Fetching recent orders...`);
    try {
        const res = await axios.get(`${WC_URL}/wp-json/wc/v3/orders`, {
            params: { consumer_key: WC_CK, consumer_secret: WC_CS, per_page: 5 },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        console.log("Response Type:", typeof res.data);
        if (Array.isArray(res.data)) {
            res.data.forEach((o: any) => {
                console.log(`Order #${o.id} - Status: ${o.status} - Payment: ${o.payment_method}`);
            });
        } else {
            console.log("Response Data:", res.data);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listOrders();
