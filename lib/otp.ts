import axios from 'axios';

// تنظیمات IPPanel از فایل .env
const API_KEY = process.env.IPPANEL_API_KEY;
const PATTERN_CODE = process.env.IPPANEL_PATTERN_CODE;
const ORIGINATOR = process.env.IPPANEL_ORIGINATOR || process.env.IPPANEL_SENDER || "+983000505";

// ✅ تغییر به آدرس پایدار REST
const IPPANEL_URL = "http://rest.ippanel.com/v1/messages/patterns/send";

export async function generateOtp(phone: string): Promise<string> {
  // تولید کد ۴ رقمی تصادفی
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  
  // ذخیره در دیتابیس (با استفاده از Prisma که در فایل session.ts داریم یا همینجا ایمپورت کنیم)
  // نکته: چون اینجا تابع مستقل است، ما فعلا ارسال را انجام می‌دهیم.
  // منطق ذخیره در دیتابیس در فایل bot.ts مدیریت می‌شود (updateSession).
  
  const sent = await sendOtp(phone, code);
  if (sent) return code;
  throw new Error("SMS Sending Failed");
}

export async function sendOtp(phone: string, code: string): Promise<boolean> {
  if (!API_KEY || !PATTERN_CODE) {
    console.error("❌ IPPanel Config Missing in .env");
    return false;
  }

  try {
    const payload = {
      "pattern_code": PATTERN_CODE,
      "originator": ORIGINATOR,
      "recipient": phone,
      "values": {
        "code": code // ⚠️ مطمئن شوید نام متغیر در پترن شما "code" است
      }
    };

    const response = await axios.post(IPPANEL_URL, payload, {
      headers: {
        'Authorization': `AccessKey ${API_KEY}`, // فرمت صحیح هدر
        'Content-Type': 'application/json'
      }
    });

    // بررسی موفقیت ارسال (IPPanel معمولا شناسه پیام (bulk_id) برمی‌گرداند)
    if (response.data && (response.data.bulk_id || response.data.data?.bulk_id)) {
      console.log(`✅ SMS Sent to ${phone}`);
      return true;
    } else {
      console.error("❌ IPPanel Response Error:", response.data);
      return false;
    }

  } catch (error: any) {
    // لاگ دقیق‌تر برای خطایابی
    console.error(`❌ Failed to send SMS via IPPanel: ${error.message}`);
    if (error.response) {
      console.error("Response Data:", error.response.data);
      console.error("Response Status:", error.response.status);
    }
    return false;
  }
}

// تابع اعتبارسنجی (تغییری نکرده)
export async function verifyOtp(phone: string, inputCode: string): Promise<boolean> {
   // این تابع معمولا کدی که در دیتابیس ذخیره شده را چک می‌کند.
   // در لاجیک فعلی شما، کد در سشن کاربر ذخیره می‌شود و در bot.ts مقایسه می‌شود.
   // پس این تابع صرفاً جهت اطمینان از فرمت ورودی است.
   return /^\d{4}$/.test(inputCode);
}
