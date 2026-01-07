import { Buffer } from 'buffer';

export function getWCCredentials(source: string = 'pgem') {
  const s = source ? source.toLowerCase() : 'pgem';
  if (s === 'arzangame') {
    return {
      siteUrl: 'https://arzangame.com', 
      key: process.env.WC_CONSUMER_KEY_ARZANGAME,
      secret: process.env.WC_CONSUMER_SECRET_ARZANGAME
    };
  }
  // Default to PGem
  return {
    siteUrl: process.env.WC_SITE_URL,
    key: process.env.WC_CONSUMER_KEY,
    secret: process.env.WC_CONSUMER_SECRET
  };
}

export async function addWooCommerceNote(wpOrderId: bigint | string, note: string, isCustomerNote: boolean = true, source: string = 'pgem') {
    const { siteUrl, key, secret } = getWCCredentials(source);

    if (!siteUrl || !key || !secret) {
        console.warn(`⚠️ تنظیمات ووکامرس برای ${source} کامل نیست، یادداشت ارسال نشد.`);
        return;
    }

    const auth = Buffer.from(`${key}:${secret}`).toString('base64');

    try {
        console.log(`�� Adding Note to Order #${wpOrderId} (${source}): ${note}`);
        const res = await fetch(`${siteUrl}/wp-json/wc/v3/orders/${wpOrderId}/notes`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                note: note,
                customer_note: isCustomerNote
            })
        });

        if (!res.ok) {
            const txt = await res.text();
            console.error(`❌ WC Note Error (${source}):`, res.status, txt);
        } else {
            console.log(`✅ WC Note Added (${source})`);
        }
    } catch (error) {
        console.error(`❌ WC Connection Error (${source}):`, error);
    }
}

export async function updateWooCommerceStatus(wpOrderId: bigint | string, status: string, source: string = 'pgem') {
    const { siteUrl, key, secret } = getWCCredentials(source);

    if (!siteUrl || !key || !secret) {
        console.warn(`⚠️ تنظیمات ووکامرس برای ${source} کامل نیست، تغییر وضعیت انجام نشد.`);
        return false;
    }

    const auth = Buffer.from(`${key}:${secret}`).toString('base64');

    try {
        console.log(`🔄 Updating Status Order #${wpOrderId} (${source}) -> ${status}`);
        const res = await fetch(`${siteUrl}/wp-json/wc/v3/orders/${wpOrderId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: status
            })
        });

        if (!res.ok) {
            const txt = await res.text();
            console.error(`❌ WC Status Error (${source}):`, res.status, txt);
            return false;
        } else {
            console.log(`✅ WC Status Updated (${source})`);
            return true;
        }
    } catch (error) {
        console.error(`❌ WC Connection Error (${source}):`, error);
        return false;
    }
}

export async function getWooCommerceOrdersBatch(orderIds: any[]) {
    console.warn("getWooCommerceOrdersBatch stub called");
    return [];
}
