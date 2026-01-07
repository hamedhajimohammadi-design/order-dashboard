import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startStr = searchParams.get('start');
    const endStr = searchParams.get('end');

    const now = new Date();
    const start = startStr ? new Date(startStr) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endStr ? new Date(endStr) : new Date();

    const orders = await prisma.order.findMany({
      where: {
        status: 'completed',
        completed_at: {
          gte: start,
          lte: end
        },
        OR: [
          { coupon_amount: { gt: 0 } },
          { loyalty_amount: { gt: 0 } },
          { affiliate_amount: { gt: 0 } }
        ]
      },
      select: {
        id: true,
        wp_order_id: true,
        final_payable: true,
        coupon_code: true,
        coupon_amount: true,
        loyalty_amount: true,
        affiliate_code: true,
        affiliate_amount: true,
        completed_at: true
      },
      orderBy: { completed_at: 'desc' }
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
