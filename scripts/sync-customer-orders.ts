
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

const WC_URL = process.env.WC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const WC_CK = process.env.WC_CONSUMER_KEY;
const WC_CS = process.env.WC_CONSUMER_SECRET;

function generateOrderTitle(lineItems: any[]): string {
  if (!lineItems || lineItems.length === 0) return 'سفارش نامشخص';
  const titles = lineItems.map(item => {
    const qtyParams = item.quantity > 1 ? ` (x${item.quantity})` : '';
    return `${item.name}${qtyParams}`;
  });
  return titles.join(' + ');
}

async function syncCustomerOrders(customerId: number) {
    console.log(`🚀 Syncing orders for Customer #${customerId}...`);
    
    let page = 1;
    let totalSynced = 0;

    while (true) {
        console.log(`   Fetching page ${page}...`);
        try {
            const res = await axios.get(`${WC_URL}/wp-json/wc/v3/orders`, {
                params: { 
                    consumer_key: WC_CK, 
                    consumer_secret: WC_CS,
                    customer: customerId,
                    per_page: 20,
                    page: page
                }
            });

            const orders = res.data;
            if (!orders || orders.length === 0) break;

            for (const order of orders) {
                const orderDate = new Date(order.date_created);
                const title = generateOrderTitle(order.line_items);
                
                // Upsert Order
                await prisma.order.upsert({
                    where: { wp_order_id: order.id },
                    update: {
                        status: order.status,
                        final_payable: order.total,
                        order_title: title,
                        order_date: orderDate,
                    },
                    create: {
                        wp_order_id: order.id,
                        order_title: title,
                        order_date: orderDate,
                        status: order.status,
                        final_payable: order.total,
                        total_amount_gross: order.total, // Assuming gross is same as total for now
                        user_id: 1, // Temporary placeholder, will be updated below
                    }
                });

                // Link User
                const phone = order.billing.phone || order.shipping.phone;
                if (phone) {
                    // Normalize phone?
                    // Assuming phone is stored as is or we need normalization logic.
                    // For now, try exact match.
                    const user = await prisma.user.findFirst({
                        where: { 
                            phone_number: phone
                        }
                    });
                    
                    if (user) {
                        await prisma.order.update({
                            where: { wp_order_id: order.id },
                            data: { user_id: user.id }
                        });
                    }
                }

                totalSynced++;
            }

            page++;
        } catch (error) {
            console.error("Error fetching orders:", error instanceof Error ? error.message : error);
            break;
        }
    }

    console.log(`✅ Synced ${totalSynced} orders.`);
}

// Customer ID 8686 (from debug output)
syncCustomerOrders(8686);
