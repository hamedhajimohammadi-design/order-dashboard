import { Telegraf, Markup, Context } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { calculateOrderETA } from '@/lib/queue';

// --- تنظیمات توکن‌ها ---
const ORDER_BOT_TOKEN = process.env.TELEGRAM_ORDER_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const FINANCE_BOT_TOKEN = process.env.TELEGRAM_FINANCE_BOT_TOKEN;

if (!ORDER_BOT_TOKEN) {
  throw new Error('❌ Telegram Order Bot Token is missing in .env');
}

const bot = new Telegraf(ORDER_BOT_TOKEN);

// ============================================================
//  1. تعریف دکمه‌ها و منوی اصلی
// ============================================================
const mainMenu = Markup.keyboard([
  ['📦 پیگیری سفارشات', '💰 امتیاز و دعوت'],
  ['🔗 اتصال حساب کاربری', '📞 پشتیبانی']
]).resize();

// ============================================================
//  2. توابع (Handlers)
// ============================================================

// --- تابع پیگیری سفارش ---
const handleTracking = async (ctx: Context) => {
  // @ts-ignore
  const tgId = BigInt(ctx.from?.id);

  const user = await prisma.user.findUnique({
    where: { telegram_chat_id: tgId }
  });

  if (!user) {
    return ctx.reply('⚠️ حساب شما متصل نیست. لطفا دکمه "🔗 اتصال حساب کاربری" را بزنید.');
  }

  const orders = await prisma.order.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' },
    take: 3
  });

  if (orders.length === 0) {
    ctx.reply('📭 شما هنوز سفارشی ثبت نکرده‌اید.');
  } else {
    for (const order of orders) {
      const statusMap: Record<string, string> = {
        'pending': 'در انتظار پرداخت 💳',
        'processing': 'در حال انجام ⚡️',
        'completed': 'تکمیل شده ✅',
        'on-hold': 'در انتظار بررسی ⏳',
        'wrong-info': 'اطلاعات اشتباه ❌',
        'waiting': 'در صف انجام 🚶'
      };
      const statusFa = statusMap[order.status] || order.status;
      
      let msg = `📦 **سفارش #${order.id}**\n🔖 وضعیت: ${statusFa}\n💰 مبلغ: ${parseInt(order.final_payable.toString()).toLocaleString()} تومان`;

      if (['waiting', 'processing'].includes(order.status)) {
        const queueInfo = await calculateOrderETA(String(order.id), order.created_at);
        if (queueInfo) {
          msg += `\n\n⏳ **نوبت تخمینی: ${queueInfo.eta}**`;
          if (queueInfo.isNextDay) msg += ' (فردا)';
          if (!queueInfo.isWorkTime) msg += '\n⚠️ (خارج از تایم کاری)';
        }
      }
      ctx.replyWithMarkdown(msg);
    }
  }
};

// --- تابع پشتیبانی ---
const handleSupport = (ctx: Context) => {
    // آیدی تلگرام خودتان را جایگزین کنید
    ctx.reply('برای ارتباط با پشتیبانی، لطفا به آیدی زیر پیام دهید:\n@PgemSupport'); 
};

// ============================================================
//  3. اتصال دکمه‌ها به توابع (بدون کامندهای اسلش)
// ============================================================

// الف) دستور Start (فقط برای شروع و نمایش منو)
bot.start((ctx) => {
  // @ts-ignore
  const firstName = ctx.from?.first_name;
  ctx.reply(
    `سلام ${firstName} عزیز! 👋\nبه ربات هوشمند پی‌جم شاپ خوش آمدید.\n\nاز منوی پایین جهت انجام کارها استفاده کنید 👇`,
    mainMenu
  );
});

// ب) اتصال دکمه‌ها
bot.hears('📦 پیگیری سفارشات', handleTracking);
bot.hears('📞 پشتیبانی', handleSupport);

// ج) دکمه اتصال حساب
bot.hears('🔗 اتصال حساب کاربری', (ctx) => {
  ctx.reply(
    'جهت شناسایی شما، دکمه زیر را بزنید و شماره موبایل خود را تایید کنید 👇',
    Markup.keyboard([
      Markup.button.contactRequest('📱 ارسال شماره موبایل (تایید خودکار)')
    ]).resize().oneTime()
  );
});

// د) دکمه امتیاز و دعوت
bot.hears('💰 امتیاز و دعوت', async (ctx) => {
  // @ts-ignore
  const tgId = BigInt(ctx.from?.id);
  let user = await prisma.user.findUnique({ where: { telegram_chat_id: tgId } });

  if (!user) return ctx.reply('⚠️ ابتدا حساب خود را متصل کنید.');

  if (!user.referral_code) {
    const newCode = `PGEM-${user.id}-${Math.floor(Math.random() * 100)}`;
    user = await prisma.user.update({
      where: { id: user.id },
      data: { referral_code: newCode }
    });
  }

  const botUsername = ctx.botInfo.username;
  const inviteLink = `https://t.me/$pgembot?start=ref_${user.referral_code}`;

  const msg = `💎 **باشگاه مشتریان**\n\n` +
              `💰 موجودی: ${user.diamond_balance} الماس\n` + 
              `⭐️ امتیاز: ${user.points}\n\n` +
              `🔗 **لینک دعوت اختصاصی شما:**\n\`${inviteLink}\`\n\n` +
              `با دعوت دوستان خود الماس رایگان بگیرید!`;

  ctx.replyWithMarkdown(msg);
});

// ه) پردازش شماره موبایل
bot.on('contact', async (ctx) => {
  const contact = ctx.message.contact;
  // @ts-ignore
  if (contact.user_id !== ctx.from.id) return ctx.reply('⛔️ فقط شماره خودتان مجاز است.');

  let phone = contact.phone_number.replace('+', '');
  if (phone.startsWith('98')) phone = '0' + phone.substring(2);
  // @ts-ignore
  const tgId = BigInt(ctx.from.id);

  try {
    const existingUser = await prisma.user.findUnique({ where: { phone_number: phone } });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        // @ts-ignore
        data: { telegram_chat_id: tgId, telegram_username: ctx.from.username }
      });
    } else {
      const randomCode = `PGEM-${Math.floor(1000 + Math.random() * 9000)}`;
      await prisma.user.create({
        data: {
          phone_number: phone,
          telegram_chat_id: tgId,
          // @ts-ignore
          telegram_username: ctx.from.username,
          // @ts-ignore
          first_name: ctx.from.first_name,
          referral_code: randomCode,
          role: 'customer'
        }
      });
    }
    ctx.reply(`✅ حساب با شماره ${phone} متصل شد.`, mainMenu);
  } catch (error) {
    console.error('Telegram DB Error:', error);
    ctx.reply('❌ خطا در اتصال.');
  }
});

export default bot;

// --- Legacy Helpers ---
type BotType = 'order' | 'finance';
export async function sendTelegramMessage(chatId: string | number | bigint, text: string, botType: BotType = 'order', replyMarkup: any = null) {
  const token = botType === 'finance' ? FINANCE_BOT_TOKEN : ORDER_BOT_TOKEN;
  if (!token || !chatId) return null;
  try {
    const url = `https://api.telegram.org/bot$8343027877:AAG2_hk0ks0wws5dEL64GFOBZr85DKzWM3g/sendMessage`;
    const body: any = { chat_id: chatId.toString(), text, parse_mode: 'HTML' };
    if (replyMarkup) body.reply_markup = replyMarkup;
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return await res.json();
  } catch (e) { return null; }
}