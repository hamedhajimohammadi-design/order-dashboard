import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const jsonWithBigInt = (data) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint'
      ? value.toString()
      : value
  ));
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;
  const skip = (page - 1) * limit;
  const sortBy = searchParams.get('sortBy') || 'order_date';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  try {
    console.log(`🔍 Searching in DB: ${query} | Sort: ${sortBy} ${sortOrder}`);

    const isNumeric = /^\d+$/.test(query);
    
    const whereCondition = {
      OR: [
        { order_title: { contains: query, mode: 'insensitive' } },
        { operator_name: { contains: query, mode: 'insensitive' } },
        { user: { first_name: { contains: query, mode: 'insensitive' } } },
        { user: { last_name: { contains: query, mode: 'insensitive' } } },
        // If numeric, try to match wp_order_id
        ...(isNumeric ? [{ wp_order_id: BigInt(query) }] : []),
      ]
    };

    // Map sortBy to Prisma fields
    let orderBy = {};
    if (sortBy === 'order_id') {
        orderBy = { wp_order_id: sortOrder };
    } else if (sortBy === 'updated') {
        orderBy = { updated_at: sortOrder };
    } else {
        orderBy = { order_date: sortOrder };
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereCondition,
        take: limit,
        skip: skip,
        orderBy: orderBy,
        include: {
          user: true,
        },
      }),
      prisma.order.count({ where: whereCondition })
    ]);

    // ---------------------------------------------------------
    // 🕵️‍♂️ Auto-Sync Logic: If not found in DB, check WooCommerce
    // ---------------------------------------------------------
    if (orders.length === 0 && isNumeric) {
        console.log(`⚠️ Order ${query} not found in DB. Trying WooCommerce...`);
        try {
            const ck = process.env.WC_CONSUMER_KEY;
            const cs = process.env.WC_CONSUMER_SECRET;
            const url = process.env.WC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
            
            const res = await fetch(`${url}/wp-json/wc/v3/orders/${query}?consumer_key=${ck}&consumer_secret=${cs}`);
            
            if (res.ok) {
                const wcOrder = await res.json();
                console.log(`✅ Found order ${query} in WC. Syncing...`);
                
                const { syncOrderWithWooCommerce } = await import('@/lib/sync-helper');
                const syncedOrder = await syncOrderWithWooCommerce(wcOrder);
                
                const fullOrder = await prisma.order.findUnique({
                    where: { id: syncedOrder.id },
                    include: { user: true }
                });

                if (fullOrder) {
                    return NextResponse.json({
                        success: true,
                        data: jsonWithBigInt([fullOrder]),
                        pagination: {
                            currentPage: 1,
                            totalPages: 1,
                            totalItems: 1
                        }
                    });
                }
            }
        } catch (e) {
            console.error("Error auto-syncing from search:", e);
        }
    }
    // ---------------------------------------------------------

    return NextResponse.json({
      success: true,
      data: jsonWithBigInt(orders),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount
      }
    });

  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ success: false, data: [], pagination: { currentPage: 1, totalPages: 1 } }, { status: 500 });
  }
}
