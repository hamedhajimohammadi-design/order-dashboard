
import 'dotenv/config';
import axios from 'axios';

const WC_URL = process.env.WC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const WC_CK = process.env.WC_CONSUMER_KEY;
const WC_CS = process.env.WC_CONSUMER_SECRET;

async function testSearch() {
  const phoneNoZero = '9173259096';
  const phoneWithZero = '09173259096';

  console.log(`Testing search for ${phoneNoZero}...`);
  try {
    const res1 = await axios.get(`${WC_URL}/wp-json/wc/v3/customers`, {
        params: { consumer_key: WC_CK, consumer_secret: WC_CS, search: phoneNoZero }
    });
    console.log(`Result for ${phoneNoZero}: Found ${res1.data.length} customers.`);
  } catch (e) { console.error(e.message); }

  console.log(`Testing search for ${phoneWithZero}...`);
  try {
    const res2 = await axios.get(`${WC_URL}/wp-json/wc/v3/customers`, {
        params: { consumer_key: WC_CK, consumer_secret: WC_CS, search: phoneWithZero }
    });
    console.log(`Result for ${phoneWithZero}: Found ${res2.data.length} customers.`);
  } catch (e) { console.error(e.message); }
}

testSearch();
