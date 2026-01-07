import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

const siteUrl = process.env.WC_SITE_URL; // Corrected env var
if (!siteUrl || !siteUrl.startsWith('http')) {
  console.error('❌ خطا: آدرس ووکا (WC_SITE_URL) تنظیم نشده است.');
  process.exit(1);
}

const WC_CK = process.env.WC_CONSUMER_KEY!;
const WC_CS = process.env.WC_CONSUMER_SECRET!;

const authHeader = `Basic ${Buffer.from(`${WC_CK}:${WC_CS}`).toString('base64')}`;
const WC_URL = siteUrl.replace(/\/$/, ""); 

const AFFILIATE_CODES = ['adeltekno', 'se7en', 'hojat', 'fcmobo'];

function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  return phone.replace(/^0+|\s+|-/g, ''); 
}

function generateOrderTitle(lineItems: any[]): string {
  if (!lineItems || lineItems.length === 0) return 'سفارش نامشخص';
  const titles = lineItems.map(item => {
    const qtyParams = item.quantity > 1 ? ` (x${item.quantity})` : '';
    return `${item.name}${qtyParams}`;
  });
  return titles.join(' + ');
}

async function fetchAndImportOrders() {
  console.log('=============================================');
  console.log('🚀 شروع دانلود (Axios + Basic Auth) از ' + WC_URL);
  
  let page = 1;
  let hasNextPage = true;
  let totalImported = 0;
  let lastFirstOrderId = null; 

  while (hasNextPage) {
    try {
      console.log(`📥 دریافت صفحه ${page}...`);
      
      const response = await axios.get(`${WC_URL}/wp-json/wc/v3/orders`, {
          params: { per_page: 100, page: page },
          headers: {
              'Authorization': authHeader,
              'User-Agent': 'OrderDashboard/2.0'
          },
          timeout: 60000
      });

      const orders = response.data;

      if (orders.length === 0) {
        hasNextPage = false;
        console.log('✅ لیست تمام شد.');
        break;
      }
      
      if (!Array.isArray(orders)) {
         console.error('❌ خطا: API آرایه برنگرداند.', String(orders).substring(0, 100));
         break;
      }

      const currentFirstId = orders[0].id;
      if (lastFirstOrderId === currentFirstId) {
          console.error(`⛔ صفحه تکراری (ID: ${currentFirstId}). توقف.`);
          break;
      }
      lastFirstOrderId = currentFirstId;

      console.log(`💾 پردازش ${orders.length} سفارش...`);

      // --- دریافت اطلاعات مشتریان برای بررسی وضعیت احراز هویت ---
      const customerIds = orders
        .map((o: any) => o.customer_id)
        .filter((id: any) => id && id !== 0);
      
      const uniqueCustomerIds = [...new Set(customerIds)];
      const customerVerificationMap = new Map<number, boolean>();

      if (uniqueCustomerIds.length > 0) {
          try {
              const customerResponse = await axios.get(`${WC_URL}/wp-json/wc/v3/customers`, {
                  params: { include: uniqueCustomerIds.join(','), per_page: 100 },
                  headers: {
                      'Authorization': authHeader,
                      'User-Agent': 'OrderDashboard/2.0'
                  },
                  timeout: 60000
              });
              
              const customers = customerResponse.data;
              
              if (Array.isArray(customers)) {
                  customers.forEach((c: any) => {
                      const isVerified = c.meta_data.some((m: any) => 
                          (m.key === '_mnsfpt_user_level_status_mnsfpt_level_1' && m.value === 'verified') ||
                          (m.key === '_mnsfpt_user_level_status_advanced' && m.value === 'verified')
                      );
                      customerVerificationMap.set(c.id, isVerified);
                  });
              }
          } catch (e: any) {
              console.error("⚠️ خطا در دریافت اطلاعات مشتریان:", e.message);
          }
      }
      // ---------------------------------------------------------

      for (const order of orders) {
        try {
            const billing = order.billing || {};
            let rawPhone = billing.phone || '';
            let normalizedPhone = normalizePhoneNumber(rawPhone);

            if (!normalizedPhone) normalizedPhone = `989000${order.id}`; 

            const metaData = Array.isArray(order.meta_data) ? order.meta_data : [];
            const feeLines = Array.isArray(order.fee_lines) ? order.fee_lines : [];
            const couponLines = Array.isArray(order.coupon_lines) ? order.coupon_lines : [];

            // تلگرام
            let chatID = null;
            let username = null;
            if (metaData.length > 0) {
                const cMeta = metaData.find((m: any) => m.key === '_telegram_chat_id');
                if (cMeta) chatID = cMeta.value;
                const uMeta = metaData.find((m: any) => m.key === '_telegram_username');
                if (uMeta) username = uMeta.value;
            }

            // کاربر
            const isVerified = customerVerificationMap.get(order.customer_id) || false;

            const user = await prisma.user.upsert({
                where: { phone_number: normalizedPhone },
                update: {
                    first_name: billing.first_name || 'کاربر',
                    last_name: billing.last_name || `مهمان-${order.id}`,
                    is_verified: isVerified,
                    ...(chatID && { telegram_chat_id: BigInt(chatID) }),
                    ...(username && { telegram_username: username }),
                },
                create: {
                    phone_number: normalizedPhone,
                    first_name: billing.first_name || 'کاربر',
                    last_name: billing.last_name || `مهمان-${order.id}`,
                    is_verified: isVerified,
                    telegram_chat_id: chatID ? BigInt(chatID) : null,
                    telegram_username: username,
                    orders_count: 0, 
                    total_spent: 0,
                }
            });

            // محاسبات مالی
            let discountType = 'none';
            let loyaltyAmount = 0;
            let loyaltyRedeemed = 0;
            
            const pjsFee = feeLines.find((f: any) => f.name && (f.name.includes('کسر از اعتبار') || f.name.includes('الماس')));
            if (pjsFee) {
                loyaltyAmount = Math.abs(parseFloat(pjsFee.total || '0'));
                discountType = 'loyalty_points';
            }
            
            const redeemMeta = metaData.find((m: any) => m.key === '_pjs_points_to_deduct');
            if (redeemMeta) loyaltyRedeemed = parseInt(redeemMeta.value || '0');

            let affiliateCode = null;
            let affiliateAmount = 0;
            let couponCode = null;
            let couponAmount = 0;
            
            if (couponLines.length > 0) {
                const coupon = couponLines[0];
                const code = coupon.code;
                const amount = parseFloat(coupon.discount || '0');
                if (AFFILIATE_CODES.includes(code)) {
                    affiliateCode = code;
                    affiliateAmount = amount;
                    discountType = (discountType === 'loyalty_points') ? 'mixed' : 'coupon_affiliate';
                } else {
                    couponCode = code;
                    couponAmount = amount;
                    discountType = (discountType === 'loyalty_points') ? 'mixed' : 'coupon_general';
                }
            }

            const totalPayable = parseFloat(order.total || '0');
            const totalGross = totalPayable + loyaltyAmount + affiliateAmount + couponAmount;

            const dateCreated = new Date(order.date_created);
            const dateCompleted = order.date_completed ? new Date(order.date_completed) : null;

            // منطق تعیین وضعیت داخلی
            let internalStatus = 'pending';
            if (order.status === 'processing') {
                internalStatus = 'waiting'; // پیش‌فرض برای ایمپورت اولیه
            } else if (order.status === 'completed') {
                internalStatus = 'completed';
            } else if (order.status === 'cancelled') {
                internalStatus = 'cancelled';
            } else if (order.status === 'failed') {
                internalStatus = 'failed';
            }

            const existing = await prisma.order.findFirst({ 
                where: { wp_order_id: BigInt(order.id), source: "pgem" } 
            });
            let statusToUpdate = internalStatus;
            
            if (existing) {
                if (existing.status === 'processing' && order.status === 'processing') {
                    statusToUpdate = 'processing'; // دست نزن
                } else if (order.status !== existing.wp_status) {
                    // وضعیت ووکامرس عوض شده، پس وضعیت داخلی هم باید سینک شود
                    statusToUpdate = internalStatus;
                } else {
                    // وضعیت ووکامرس عوض نشده، وضعیت داخلی را حفظ کن
                    statusToUpdate = existing.status;
                }
            }

            await prisma.order.upsert({
                where: { 
                    wp_order_id_source: { 
                        wp_order_id: BigInt(order.id), 
                        source: "pgem" 
                    } 
                },
                update: {
                    status: statusToUpdate,
                    wp_status: order.status,
                    final_payable: totalPayable,
                    total_amount_gross: totalGross,
                    order_title: generateOrderTitle(order.line_items),
                    order_date: dateCreated,
                    completed_at: dateCompleted,
                    snapshot_data: order, 
                },
                create: {
                    wp_order_id: BigInt(order.id),
                    source: "pgem", // Explicitly set source
                    user_id: user.id,
                    total_amount_gross: totalGross,
                    final_payable: totalPayable,
                    payment_method: order.payment_method_title,
                    payment_gate_id: order.payment_method,
                    customer_note: order.customer_note,
                    discount_type: discountType,
                    affiliate_code: affiliateCode,
                    affiliate_amount: affiliateAmount,
                    coupon_code: couponCode,
                    coupon_amount: couponAmount,
                    loyalty_redeemed: loyaltyRedeemed,
                    loyalty_amount: loyaltyAmount,
                    status: internalStatus,
                    wp_status: order.status,
                    snapshot_data: order, 
                    order_title: generateOrderTitle(order.line_items),
                    order_date: dateCreated,
                    completed_at: dateCompleted,
                    created_at: new Date()
                }
            });
            
            totalImported++;

        } catch (innerError: any) {
             console.error(`خطا در سفارش ${order.id}:`, innerError.message);
        }
      }

      console.log(`✅ صفحه ${page} کامل شد. (مجموع: ${totalImported})`);
      page++;

    } catch (error: any) {
      console.error('❌ خطا:', error.message);
      if (error.response) console.error(error.response.status, error.response.statusText);
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  console.log(`🏁 پایان دانلود. مجموع ${totalImported} سفارش ذخیره شد.`);
  await calculateCustomerAnalytics();
}

async function calculateCustomerAnalytics() {
  console.log('\n📊 به روز رسانی آمار...');
  const users = await prisma.user.findMany({ select: { id: true } });
  for (const user of users) {
    const stats = await prisma.order.aggregate({
      where: { user_id: user.id, status: 'completed' },
      _sum: { final_payable: true },
      _count: { id: true },
      _max: { order_date: true }
    });
    await prisma.user.update({
      where: { id: user.id },
      data: {
        total_spent: stats._sum.final_payable || 0,
        orders_count: stats._count.id || 0,
        last_order_date: stats._max.order_date || undefined
      }
    });
  }
  console.log('✅ تمام شد.');
  await prisma.$disconnect();
}

fetchAndImportOrders();
