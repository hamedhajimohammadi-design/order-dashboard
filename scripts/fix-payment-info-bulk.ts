import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const WC_URL = process.env.WC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const WC_CK = process.env.WC_CONSUMER_KEY;
const WC_CS = process.env.WC_CONSUMER_SECRET;

// Zibal merchant/token (همونی که در inquiry می‌فرستی)
const ZIBAL_MERCHANT = process.env.ZIBAL_MERCHANT || process.env.ZIBAL_API_TOKEN;

const CHECKPOINT_FILE = path.join(process.cwd(), ".fix-zibal-checkpoint.json");

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (k: string) => {
    const i = args.indexOf(k);
    return i >= 0 ? args[i + 1] : undefined;
  };

  const limit = parseInt(get("--limit") || "1000", 10);
  const delay = parseInt(get("--delay") || "200", 10);
  const reset = args.includes("--reset");

  return {
    limit: Number.isFinite(limit) ? limit : 1000,
    delay: Number.isFinite(delay) ? delay : 200,
    reset,
  };
}

type Checkpoint = {
  processedDbIds: number[];
  updated: number;
  failed: number;
  skippedNoTrackId: number;
  lastRunAt: string;
};

function loadCheckpoint(): Checkpoint {
  if (!fs.existsSync(CHECKPOINT_FILE)) {
    return {
      processedDbIds: [],
      updated: 0,
      failed: 0,
      skippedNoTrackId: 0,
      lastRunAt: new Date().toISOString(),
    };
  }
  try {
    const raw = fs.readFileSync(CHECKPOINT_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      processedDbIds: Array.isArray(parsed.processedDbIds) ? parsed.processedDbIds : [],
      updated: parsed.updated || 0,
      failed: parsed.failed || 0,
      skippedNoTrackId: parsed.skippedNoTrackId || 0,
      lastRunAt: parsed.lastRunAt || new Date().toISOString(),
    };
  } catch {
    return {
      processedDbIds: [],
      updated: 0,
      failed: 0,
      skippedNoTrackId: 0,
      lastRunAt: new Date().toISOString(),
    };
  }
}

function saveCheckpoint(cp: Checkpoint) {
  cp.lastRunAt = new Date().toISOString();
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(cp, null, 2));
}

function extractTrackIdFromSnapshot(snapshot: any): string | number | null {
  if (!snapshot) return null;

  if (snapshot.transaction_id) return snapshot.transaction_id;

  const meta = snapshot.meta_data;
  if (Array.isArray(meta)) {
    const trackMeta = meta.find(
      (m: any) =>
        m?.key === "transaction_id" ||
        m?.key === "_zibal_track_id" ||
        m?.key === "wc_zibal_track_id"
    );
    if (trackMeta?.value) return trackMeta.value;
  }

  return null;
}

function extractTrackIdFromWcOrder(order: any): string | number | null {
  if (!order) return null;

  if (order.transaction_id) return order.transaction_id;

  const meta = order.meta_data;
  if (Array.isArray(meta)) {
    const trackMeta = meta.find(
      (m: any) =>
        m?.key === "transaction_id" ||
        m?.key === "_zibal_track_id" ||
        m?.key === "wc_zibal_track_id"
    );
    if (trackMeta?.value) return trackMeta.value;
  }

  return null;
}

async function fetchWcOrder(wpOrderId: number) {
  if (!WC_URL || !WC_CK || !WC_CS) return null;

  const res = await axios.get(`${WC_URL}/wp-json/wc/v3/orders/${wpOrderId}`, {
    params: { consumer_key: WC_CK, consumer_secret: WC_CS },
    timeout: 30000,
  });
  return res.data;
}

async function zibalInquiry(trackId: string | number) {
  const res = await axios.post(
    "https://gateway.zibal.ir/v1/inquiry",
    { merchant: ZIBAL_MERCHANT, trackId },
    { timeout: 30000 }
  );
  return res.data;
}

async function main() {
  const { limit, delay, reset } = parseArgs();

  console.log("🚀 Starting Bulk Fix for Zibal Orders (robust) ...");
  console.log(`   limit=${limit} delay=${delay}ms reset=${reset}`);

  if (!ZIBAL_MERCHANT) {
    console.error("❌ Missing ZIBAL_MERCHANT or ZIBAL_API_TOKEN in .env");
    process.exit(1);
  }

  let checkpoint = loadCheckpoint();
  if (reset) {
    checkpoint = {
      processedDbIds: [],
      updated: 0,
      failed: 0,
      skippedNoTrackId: 0,
      lastRunAt: new Date().toISOString(),
    };
    saveCheckpoint(checkpoint);
    console.log("♻️ Checkpoint reset.");
  }

  const processedSet = new Set<number>(checkpoint.processedDbIds);

  // 1000 سفارش آخر (در دیتابیس داشبورد) که زیبال هستند و card ندارند
  const orders = await prisma.order.findMany({
    where: {
      payment_card_number: null,
      OR: [
        { payment_method: { contains: "زیبال" } },
        { payment_gate_id: { contains: "zibal", mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      wp_order_id: true,
      payment_method: true,
      payment_gate_id: true,
      snapshot_data: true,
      created_at: true,
    },
    orderBy: { id: "desc" },
    take: limit,
  });

  console.log(`Found ${orders.length} candidate orders (missing card).`);
  console.log(`Checkpoint already processed: ${processedSet.size}`);

  for (const o of orders) {
    if (processedSet.has(o.id)) {
      // قبلاً پردازش شده (برای Resume)
      continue;
    }

    const wpId = o.wp_order_id;
    console.log(`\nProcessing DB#${o.id} / Order #${wpId} ...`);

    try {
      let trackId: any = extractTrackIdFromSnapshot(o.snapshot_data as any);

      if (!trackId) {
        // اگر snapshot ناقص بود، از WC بکش
        if (wpId) {
          console.log("   ℹ️ No trackId in snapshot. Fetching from WooCommerce...");
          const wcOrder = await fetchWcOrder(Number(wpId));

          trackId = extractTrackIdFromWcOrder(wcOrder);

          // اگر از WC پیدا شد، snapshot_data را هم آپدیت کن تا دفعه بعد سریع‌تر باشد
          if (trackId && wcOrder) {
            await prisma.order.update({
              where: { id: o.id },
              data: { snapshot_data: wcOrder },
            });
            console.log("   ✅ Snapshot refreshed from WC.");
          }
        }
      }

      if (!trackId) {
        console.log(`   ⚠️ No Track ID found (snapshot+WC). Skipping.`);
        checkpoint.skippedNoTrackId++;
        processedSet.add(o.id);
        checkpoint.processedDbIds.push(o.id);
        saveCheckpoint(checkpoint);
        continue;
      }

      console.log(`   Track ID: ${trackId} | Inquiring Zibal...`);

      const z = await zibalInquiry(trackId);

      // اگر IP مشکل داشته باشه
      if (z?.result === 105) {
        console.error("   ⛔️ Zibal says invalid IP (105). Must run on allowed server IP.");
        process.exit(1);
      }

      const card = z?.cardNumber;
      if (!card) {
        console.log(`   ❌ Zibal returned no cardNumber. result=${z?.result} message=${z?.message}`);
        checkpoint.failed++;
      } else {
        console.log(`   ✅ Found Card: ${card}`);

        await prisma.order.update({
          where: { id: o.id },
          data: {
            payment_card_number: card,
            payment_method: "zibal", // normalize
          },
        });

        checkpoint.updated++;
      }

      // mark processed (حتی اگر fail شد، دوباره بی‌خودی نچرخه؛ اگر خواستی retry کنی، --reset بزن)
      processedSet.add(o.id);
      checkpoint.processedDbIds.push(o.id);
      saveCheckpoint(checkpoint);

      await sleep(delay);
    } catch (err: any) {
      console.error(`   ❌ Error: ${err?.message || err}`);

      // اگر Axios error بود و 105 بود:
      if (axios.isAxiosError(err) && err.response?.data?.result === 105) {
        console.error("   ⛔️ IP RESTRICTED (105). Run on server allowlisted IP.");
        process.exit(1);
      }

      checkpoint.failed++;
      processedSet.add(o.id);
      checkpoint.processedDbIds.push(o.id);
      saveCheckpoint(checkpoint);
      await sleep(delay);
    }
  }

  console.log("\n🎉 Done.");
  console.log(`Updated: ${checkpoint.updated}`);
  console.log(`Failed: ${checkpoint.failed}`);
  console.log(`Skipped (no trackId): ${checkpoint.skippedNoTrackId}`);
  console.log(`Checkpoint file: ${CHECKPOINT_FILE}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
