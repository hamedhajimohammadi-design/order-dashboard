import { prisma } from '@/lib/prisma';

export async function calculateOrderETA(orderId: string, dateCreated: string | Date) {
    try {
        const orderDate = typeof dateCreated === 'string' ? new Date(dateCreated) : dateCreated;
        
        // تاریخ شروع سیستم صف (همه سفارش‌های جدیدتر از ۲۰۲۴ را شامل شود)
        const CUTOFF_DATE = new Date('2024-01-01T00:00:00.000Z');

        if (orderDate < CUTOFF_DATE) {
             return null;
        }

        // تعداد افرادی که جلوتر هستند (شامل Waiting و Processing)
        // و باید بعد از تاریخ Cutoff باشند
        const ordersAhead = await prisma.order.count({
            where: {
                status: { in: ['waiting', 'processing'] },
                created_at: { 
                    lt: orderDate,
                    gte: CUTOFF_DATE
                }
            }
        });

        const OPERATORS_COUNT = 3; 
        const TIME_PER_ORDER = 15; 

        // فرمول اصلاح شده:
        // ما سه تا اپراتور داریم. نفر ۱، ۲، ۳ همزمان انجام می‌شوند (۱۵ دقیقه).
        // نفر ۴، ۵، ۶ در ۱۵ دقیقه دوم (۳۰ دقیقه).
        // نفر N در Batch شماره Math.floor(ordersAhead / 3) قرار می‌گیرد.
        // زمان اتمام = (Batch + 1) * 15.
        
        const batchNumber = Math.floor(ordersAhead / OPERATORS_COUNT);
        const totalMinutes = (batchNumber + 1) * TIME_PER_ORDER;
        
        const now = new Date();
        const estimatedTime = new Date(now.getTime() + totalMinutes * 60000);
        
        // محاسبه ساعت فعلی به وقت تهران
        const tehranTimeStr = new Date().toLocaleString("en-US", {timeZone: "Asia/Tehran"});
        const tehranDate = new Date(tehranTimeStr);
        const currentHour = tehranDate.getHours();

        // تایم کاری: ۹ صبح تا ۱۲ شب (۲۴:۰۰)
        // یعنی از ساعت ۰۹:۰۰ تا ۲۳:۵۹ سفارش انجام می‌شود.
        // اگر ساعت فعلی ۰ تا ۸ باشد، خارج از تایم کاری است.
        const isWorkTime = currentHour >= 9;

        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        
        let timeString = '';
        if (hours > 0) timeString += `${hours} ساعت و `;
        timeString += `${mins} دقیقه`;

        const isNextDay = estimatedTime.getDate() !== now.getDate();
        
        return {
            position: ordersAhead + 1,
            eta: timeString,
            minutes: totalMinutes,
            isNextDay,
            isWorkTime
        };
    } catch (e) {
        console.error('Queue Calc Error:', e);
        return null;
    }
}
