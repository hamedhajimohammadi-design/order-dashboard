import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api"; // @ts-ignore
import dotenv from 'dotenv';
import path from 'path';

// مسیر فایل .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envLocalPath });

const api = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL || "https://pgemshop.com",
  consumerKey: process.env.WC_CONSUMER_KEY!, 
  consumerSecret: process.env.WC_CONSUMER_SECRET!, 
  version: "wc/v3",
  axiosConfig: {
    headers: {
      "User-Agent": "Node.js/Inspector",
      "Content-Type": "application/json",
      // 🍪 کوکی رو چک کن که منقضی نشده باشه 🍪
      "Cookie": "uap_test_cookie=1; wp-settings-time-23595=1747577925; wp-settings-23595=posts_list_mode%3Dlist%26libraryContent%3Dbrowse; tk_or=%22https%3A%2F%2Fsearch.google.com%2F%22; tk_lr=%22%22; _ga=GA1.1.1440994772.1757049625; woodmart_wishlist_count=2; woodmart_wishlist_hash=9ff111c47078b60ccfa4d8ae6165387a; mp_a36067b00a263cce0299cfd960e26ecf_mixpanel=%7B%22distinct_id%22%3A%22%24device%3A7ad6ab93-3ccb-4a50-94f0-02fe9ca09f06%22%2C%22%24device_id%22%3A%227ad6ab93-3ccb-4a50-94f0-02fe9ca09f06%22%2C%22%24initial_referrer%22%3A%22https%3A%2F%2Fpgemshop.com%2Fwp-admin%2Foptions-general.php%3Fpage%3Dwprocket%22%2C%22%24initial_referring_domain%22%3A%22pgemshop.com%22%2C%22__mps%22%3A%7B%7D%2C%22__mpso%22%3A%7B%22%24initial_referrer%22%3A%22https%3A%2F%2Fpgemshop.com%2Fwp-admin%2Foptions-general.php%3Fpage%3Dwprocket%22%2C%22%24initial_referring_domain%22%3A%22pgemshop.com%22%7D%2C%22__mpus%22%3A%7B%7D%2C%22__mpa%22%3A%7B%7D%2C%22__mpu%22%3A%7B%7D%2C%22__mpr%22%3A%5B%5D%2C%22__mpap%22%3A%5B%5D%7D; wp-settings-2=libraryContent%3Dbrowse%26posts_list_mode%3Dlist%26editor%3Dtinymce%26advImgDetails%3Dshow%26hidetb%3D1%26imgsize%3Dfull%26align%3Dcenter%26editor_plain_text_paste_warning%3D1%26mfold%3D%26yithFwSidebarFold%3Do; wp-settings-time-2=1766525762; d_user_session=93554b36196c55facabd769bcd06de3c1cc709340c12fc0a5526c931cb9a14f9436482932595d58d0785e8f6338682604079ae1735ff69548c2c84d8e28e182b; wordpress_test_cookie=WP%20Cookie%20check; wordpress_logged_in_b52ec49a7c2de7af03daa5ec45587e2c=Hamedhajimohammadi%7C1767549059%7CrNdHYZyS4UmTj7tAMJppDEc59k880oWt5JDW9avo6wc%7C601e8a5fbee79e36df712f40ef913e8d26c69a95c42058e42c9f3046386b6df7; woocommerce_items_in_cart=1; woocommerce_cart_hash=aff94e448f5decfcd219c9caaf10b778; wp_woocommerce_session_b52ec49a7c2de7af03daa5ec45587e2c=2%7C%7C1767549065%7C%7C1767545465%7C%7C94c95578078430336e5a41c6f5377476; Human=12176743052625:151.135.30.111; sbjs_migrations=1418474375998%3D1; sbjs_current_add=fd%3D2026-01-03%2008%3A55%3A32%7C%7C%7Cep%3Dhttps%3A%2F%2Fpgemshop.com%2F%7C%7C%7Crf%3Dhttps%3A%2F%2Fpgemshop.com%2Fwp-admin.php; sbjs_first_add=fd%3D2026-01-03%2008%3A55%3A32%7C%7C%7Cep%3Dhttps%3A%2F%2Fpgemshop.com%2F%7C%7C%7Crf%3Dhttps%3A%2F%2Fpgemshop.com%2Fwp-admin.php; sbjs_current=typ%3Dtypein%7C%7C%7Csrc%3D%28direct%29%7C%7C%7Cmdm%3D%28none%29%7C%7C%7Ccmp%3D%28none%29%7C%7C%7Ccnt%3D%28none%29%7C%7C%7Ctrm%3D%28none%29%7C%7C%7Cid%3D%28none%29%7C%7C%7Cplt%3D%28none%29%7C%7C%7Cfmt%3D%28none%29%7C%7C%7Ctct%3D%28none%29; sbjs_first=typ%3Dtypein%7C%7C%7Csrc%3D%28direct%29%7C%7C%7Cmdm%3D%28none%29%7C%7C%7Ccmp%3D%28none%29%7C%7C%7Ccnt%3D%28none%29%7C%7C%7Ctrm%3D%28none%29%7C%7C%7Cid%3D%28none%29%7C%7C%7Cplt%3D%28none%29%7C%7C%7Cfmt%3D%28none%29%7C%7C%7Ctct%3D%28none%29; sbjs_udata=vst%3D1%7C%7C%7Cuip%3D%28none%29%7C%7C%7Cuag%3DMozilla%2F5.0%20%28Macintosh%3B%20Intel%20Mac%20OS%20X%2010_15_7%29%20AppleWebKit%2F537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F143.0.0.0%20Safari%2F537.36; sbjs_session=pgs%3D1%7C%7C%7Ccpg%3Dhttps%3A%2F%2Fpgemshop.com%2F; _ga_LBPT6DC1WN=GS2.1.s1767430532$o115$g0$t1767430532$j60$l0$h0; _clck=1k8ond2%5E2%5Eg2e%5E0%5E1938; _clsk=198dxab%5E1767430534122%5E1%5E1%5El.clarity.ms%2Fcollect" 
    }
  }
});

async function inspectOrder() {
  // 👇👇👇 شماره سفارش زرین‌پالی رو اینجا بنویس 👇👇👇
  const ORDER_ID = 5054278; // <--- این عدد رو عوض کن!

  console.log(`🔍 Inspecting Order #${ORDER_ID} ...`);

  try {
    const response = await api.get(`orders/${ORDER_ID}`);
    const order = response.data;

    if (!order) {
        console.error("❌ Order Not Found! (Response is empty)");
        return;
    }

    console.log(`✅ Order Found. Status: ${order.status}`);
    console.log(`💳 Payment Method: ${order.payment_method} (${order.payment_method_title})`);
    console.log(`🆔 Transaction ID: ${order.transaction_id}`);

    console.log("\n============================================");
    console.log("📦 ORDER META DATA (All Keys)");
    console.log("============================================");
    
    if (order.meta_data && Array.isArray(order.meta_data)) {
        order.meta_data.forEach((meta: any) => {
            // فقط کلیدهای مهم رو چاپ کن که شلوغ نشه، یا همه رو چاپ کن
            // اینجا همه رو چاپ میکنیم که کلید زرین پال رو پیدا کنیم
            console.log(`🔑 ${meta.key}: ${JSON.stringify(meta.value).substring(0, 100)}`);
            
            // هایلایت کردن کلیدهای مشکوک به زرین پال
            if (meta.key.includes('zarin') || meta.key.includes('card') || meta.key.includes('pan') || meta.key.includes('ref')) {
                console.log(`✨✨✨ POSSIBLE MATCH ABOVE ✨✨✨`);
            }
        });
    } else {
        console.log("⚠️ No meta_data found for this order.");
    }

  } catch (error: any) {
    console.error("❌ Error:", error.response ? error.response.data : error.message);
  }
}

inspectOrder();