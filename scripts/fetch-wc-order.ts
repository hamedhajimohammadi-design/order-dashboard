
import 'dotenv/config';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WC_URL = process.env.WC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const WC_CK = process.env.WC_CONSUMER_KEY;
const WC_CS = process.env.WC_CONSUMER_SECRET;

async function fetchOrder() {
  const orderId = 5054482;
  console.log(`Fetching Order #${orderId} from WooCommerce...`);

  try {
    const res = await axios.get(`${WC_URL}/wp-json/wc/v3/orders/${orderId}`, {
      params: {
        consumer_key: WC_CK,
        consumer_secret: WC_CS,
      },
    });

    const order = res.data;
    const customerId = order.customer_id;
    const billingPhone = order.billing?.phone;

    console.log(`✅ Order Found!`);
    console.log(`   Customer ID: ${customerId}`);
    console.log(`   Billing Phone: ${billingPhone}`);

    // Now check local DB
    console.log(`\nChecking Local DB for this customer...`);
    
    // Try by phone
    const userByPhone = await prisma.user.findFirst({
        where: { phone_number: billingPhone } // Note: might need normalization
    });

    if (userByPhone) {
        console.log(`   ✅ User found by phone #${userByPhone.id}`);
        console.log(`   Metadata:`, userByPhone.metadata);
        console.log(`   Verification File: ${userByPhone.verification_file}`);
        
        const meta = userByPhone.metadata as any;
        if (meta?.wc_id) {
            console.log(`   ✅ wc_id is present: ${meta.wc_id}`);
            if (String(meta.wc_id) !== String(customerId)) {
                console.log(`   ⚠️ WARNING: wc_id (${meta.wc_id}) does not match Order Customer ID (${customerId})!`);
            }
        } else {
            console.log(`   ❌ wc_id is MISSING in metadata!`);
        }
    } else {
        console.log(`   ❌ User NOT found in local DB by phone: ${billingPhone}`);
    }

  } catch (error: any) {
    console.error("Error fetching order:", error.response?.data || error.message);
  }
}

fetchOrder()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
