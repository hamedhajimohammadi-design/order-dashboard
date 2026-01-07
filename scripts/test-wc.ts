
import 'dotenv/config';
import axios from 'axios';

const WC_URL = process.env.WC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const WC_CK = process.env.WC_CONSUMER_KEY;
const WC_CS = process.env.WC_CONSUMER_SECRET;

async function test() {
    console.log("Testing WC connection...");
    try {
        // Try Customers
        console.log("Fetching Customer 2...");
        const cRes = await axios.get(`${WC_URL}/wp-json/wc/v3/customers/2`, {
            params: { consumer_key: WC_CK, consumer_secret: WC_CS }
        });
        console.log("Customer 2 Status:", cRes.status);
        console.log("Customer 2 Data Type:", typeof cRes.data);

        // Try Orders
        console.log("Fetching Orders...");
        const oRes = await axios.get(`${WC_URL}/wp-json/wc/v3/orders`, {
            params: { consumer_key: WC_CK, consumer_secret: WC_CS, per_page: 1 }
        });
        console.log("Orders Status:", oRes.status);
        console.log("Orders Data Type:", typeof oRes.data);

    } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : error);
    }
}

test();
