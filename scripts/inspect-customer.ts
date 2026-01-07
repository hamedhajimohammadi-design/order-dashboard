
import 'dotenv/config';
import axios from 'axios';

const WC_URL = process.env.WC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const WC_CK = process.env.WC_CONSUMER_KEY;
const WC_CS = process.env.WC_CONSUMER_SECRET;

async function inspectCustomer() {
  const id = 43960;
  try {
    const res = await axios.get(`${WC_URL}/wp-json/wc/v3/customers/${id}`, {
        params: { consumer_key: WC_CK, consumer_secret: WC_CS }
    });
    const c = res.data;
    console.log(`ID: ${c.id}`);
    console.log(`Email: ${c.email}`);
    console.log(`Username: ${c.username}`);
    console.log(`Billing Phone: ${c.billing?.phone}`);
    console.log(`Meta Data Keys:`, c.meta_data.map((m:any) => m.key));
  } catch (e) { console.error(e.message); }
}

inspectCustomer();
