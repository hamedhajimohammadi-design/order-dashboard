
import 'dotenv/config';
import axios from 'axios';

async function testWc() {
    const siteUrl = process.env.WC_SITE_URL || "https://pgemshop.com";
    const key = process.env.WC_CONSUMER_KEY || "ck_629b6752b3c46c05c5a9d1ef66b2f52055ce51fb";
    const secret = process.env.WC_CONSUMER_SECRET || "cs_d00f5e84afaf476c07d20aa32ca0d94c429ae26f";

    const auth = Buffer.from(`${key}:${secret}`).toString('base64');
    const url = `${siteUrl}/wp-json/wc/v3/orders?per_page=1`;

    console.log(`Fetching: ${url}`);

    try {
        const res = await axios.get(url, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            validateStatus: () => true // Don't throw on error status
        });

        console.log(`Status: ${res.status} ${res.statusText}`);
        
        if (typeof res.data === 'object') {
            console.log("✅ Valid JSON received.");
            console.log("First order ID:", res.data[0]?.id);
        } else {
            console.log("❌ Invalid JSON. Response content:");
            console.log(String(res.data).substring(0, 500)); // Print first 500 chars
        }

    } catch (e: any) {
        console.error("Network Error:", e.message);
    }
}

testWc();
