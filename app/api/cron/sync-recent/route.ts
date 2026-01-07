import { NextResponse } from 'next/server';
import { syncOrderWithWooCommerce } from '@/lib/sync-helper';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(req: Request) {
  try {
    // 1. WooCommerce Config
    const siteUrl = process.env.WC_SITE_URL;
    const key = process.env.WC_CONSUMER_KEY;
    const secret = process.env.WC_CONSUMER_SECRET;

    if (!siteUrl || !key || !secret) {
      return NextResponse.json({ error: 'WooCommerce config missing' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') || '10';
    const specificId = searchParams.get('id');

    let url = `${siteUrl}/wp-json/wc/v3/orders?per_page=${limit}`;
    if (specificId) {
        url = `${siteUrl}/wp-json/wc/v3/orders/${specificId}`;
    }

    // 2. Fetch Orders
    const auth = Buffer.from(`${key}:${secret}`).toString('base64');
    const wcRes = await fetch(url, {
      headers: {
        'Authorization': `Basic ${auth}`
      },
      cache: 'no-store'
    });

    if (!wcRes.ok) {
        const text = await wcRes.text();
        console.error('WooCommerce Fetch Error:', wcRes.status, text);
        return NextResponse.json({ error: 'Failed to fetch from WooCommerce', details: text }, { status: wcRes.status });
    }

    const contentType = wcRes.headers.get("content-type");
    if (!contentType || contentType.indexOf("application/json") === -1) {
        const text = await wcRes.text();
        console.error("❌ [Cron] Sync Recent: Received non-JSON response:", text.substring(0, 200));
        return NextResponse.json({ error: 'WooCommerce returned non-JSON response (WAF/HTML)' }, { status: 502 });
    }

    let data = await wcRes.json();
    
    // If specific ID is requested, WooCommerce returns a single object, not array.
    if (!Array.isArray(data)) {
        data = [data];
    }
    
    const orders = data;
    const results = [];

    // 3. Sync Each Order
    for (const order of orders) {
        try {
            const result = await syncOrderWithWooCommerce(order);
            results.push({ id: order.id, status: 'synced', internalId: result.id });
        } catch (e: any) {
            console.error(`Error syncing order ${order.id}:`, e);
            results.push({ id: order.id, status: 'error', error: e.message });
        }
    }

    return NextResponse.json({ 
        success: true, 
        count: orders.length,
        results 
    });

  } catch (error: any) {
    console.error('❌ Cron Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
