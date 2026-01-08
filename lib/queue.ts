import { prisma } from '@/lib/prisma';

export async function calculateOrderETA(orderId: string, dateCreated: string | Date) {
    try {
        const orderDate = typeof dateCreated === 'string' ? new Date(dateCreated) : dateCreated;
        
        // تاریخ شروع سیستم صف جدید
        const CUTOFF_DATE = new Date('2025-12-31T00:00:00.000Z');

        if (orderDate < CUTOFF_DATE) {
             return null;
        }

        const ordersAhead = await prisma.order.count({
            where: {
                status: { in: ['waiting', 'processing'] },
                order_date: { 
                    lt: orderDate,
                    gte: CUTOFF_DATE
                }
            }
        });

        const OPERATORS_COUNT = 3; 
        const TIME_PER_ORDER = 15; 

        // فرمول: (تعداد افراد جلو * زمان هر نفر) / تعداد اپراتور
        const totalMinutes = Math.ceil((ordersAhead * TIME_PER_ORDER) / OPERATORS_COUNT);
        
        const now = new Date();
        const estimatedTime = new Date(now.getTime() + totalMinutes * 60000);
        
        // محاسبه ساعت فعلی به وقت تهران
        const tehranTimeStr = new Date().toLocaleString("en-US", {timeZone: "Asia/Tehran"});
        const tehranDate = new Date(tehranTimeStr);
        const currentHour = tehranDate.getHours();

        // تایم کاری: ۹ صبح تا ۱۲ شب (۲۴:۰۰ یا ۰۰:۰۰)
        // ساعت‌های کاری: ۹، ۱۰، ...، ۲۳. (ساعت ۰ تا ۸ تعطیل است)
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
        console.error('Queue Calc Error:', e, orderId);
        return null;
    }
}
