import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

const WC_URL = process.env.WC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const WC_CK = process.env.WC_CONSUMER_KEY;
const WC_CS = process.env.WC_CONSUMER_SECRET;

async function fixUserData(customerId: number, orderId: number) {
    console.log(`🚀 Fetching WC Customer ${customerId}...`);

    try {
        const res = await axios.get(`${WC_URL}/wp-json/wc/v3/customers/${customerId}`, {
            params: { consumer_key: WC_CK, consumer_secret: WC_CS, context: 'edit' }
        });

        const customer = res.data;
        if (!customer) {
            console.error("❌ Customer not found in WC.");
            return;
        }

        // Logic from sync-helper.ts
        const authMeta = customer.meta_data.find((m: any) => m.key === '_mnsfpt_user_authenticate');
        let card_number = null;
        let national_code = null;
        let real_name = null;
        let bank_name = null;
        let verification_file = null;
        let hasImage = false;

        if (authMeta && authMeta.value) {
            const data = authMeta.value;
            const fields = Array.isArray(data) ? data[0] : data;
            
            real_name = fields['mnsfpt_field_1_1'] || null;
            national_code = fields['mnsfpt_field_2_1'] || null;
            // THE FIX: Check both fields
            card_number = fields['mnsfpt_field_12_1'] || fields['mnsfpt_field_3_1'] || null;
            bank_name = fields['mnsfpt_field_4_1'] || null;
            verification_file = fields['mnsfpt_field_7_1'] || null;
            
            if (verification_file && verification_file.length > 0) {
                hasImage = true;
            }
        }

        const isStatusVerified = customer.meta_data.some((m: any) => 
            (m.key === '_mnsfpt_user_level_status_mnsfpt_level_1' && m.value === 'verified')
        );

        const is_verified = isStatusVerified && hasImage;

        console.log(`   extracted card_number: ${card_number}`);
        console.log(`   extracted is_verified: ${is_verified}`);

        // Find user via Order
        console.log(`   Looking for order #${orderId} in DB...`);
        const order = await prisma.order.findFirst({
            where: { wp_order_id: orderId },
            include: { user: true }
        });

        if (order && order.user) {
            console.log(`✅ User found via Order (ID: ${order.user.id}, Phone: ${order.user.phone_number}). Updating...`);
            await prisma.user.update({
                where: { id: order.user.id },
                data: {
                    real_name,
                    national_code,
                    card_number,
                    bank_name,
                    verification_file,
                    is_verified
                }
            });
            console.log("✅ User updated successfully.");
        } else {
            console.error("❌ Order or User not found in DB.");
            // Fallback: Try phone number from logs
            const phone = "9033208877";
            console.log(`   Trying fallback phone: ${phone}`);
            const user = await prisma.user.findUnique({ where: { phone_number: phone } });
            if (user) {
                console.log(`✅ User found by phone (ID: ${user.id}). Updating...`);
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        real_name,
                        national_code,
                        card_number,
                        bank_name,
                        verification_file,
                        is_verified
                    }
                });
                console.log("✅ User updated successfully.");
            } else {
                console.error("❌ User not found by phone either.");
            }
        }

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

// Customer ID 2, Order ID 5054362
fixUserData(2, 5054362);
