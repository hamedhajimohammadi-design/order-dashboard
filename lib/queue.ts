import { prisma } from '@/lib/prisma';

export async function calculateOrderETA(orderId: string, dateCreated: string | Date) {
    try {
        const orderDate = typeof dateCreated === 'string' ? new Date(dateCreated) : dateCreated;
        
        // Count orders ahead in queue (processing/pending) created before this one
        const ordersAhead = await prisma.order.count({
            where: {
                status: { in: ['processing', 'pending'] },
                order_date: { lt: orderDate }
            }
        });

        // Simple algorithm: 15 mins per order
        const minutes = (ordersAhead + 1) * 15;
        
        return {
            position: ordersAhead + 1,
            eta: `${minutes} دقیقه`,
            minutes,
            isNextDay: false,  // Default to false for now
            isWorkTime: true   // Default to true for now
        };
    } catch (e) {
        console.error('Queue Calc Error:', e);
        return null;
    }
}
