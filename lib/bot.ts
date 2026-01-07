import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateSession, updateSession, setSessionUser } from '@/lib/session';
import { generateAIResponse } from '@/lib/ai';
import { getKnowledgeAnswer } from '@/lib/knowledge';
import { generateOtp, verifyOtp } from '@/lib/otp';

// Function to normalize Persian/Arabic characters
function normalizePersian(str: string) {
  if (!str) return '';
  return str
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\u064A/g, '\u06CC') // Arabic Yeh
    .replace(/\u0643/g, '\u06A9') // Arabic Kaf
    .trim();
}

// Helper to calculate queue position
async function getQueuePosition(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { created_at: true, status: true }
  });

  if (!order) return null;
  if (order.status !== 'WAITING') return 0;

  const count = await prisma.order.count({
    where: {
      status: 'WAITING',
      created_at: { lt: order.created_at }
    }
  });

  return count + 1;
}

export async function handleBotRequest(req: Request) {
  try {
    // 1. Safely parse JSON
    let body;
    try {
        body = await req.json();
    } catch (e) {
        return NextResponse.json({ status: 'error', message: 'Invalid JSON body' }, { status: 400 });
    }

    console.log('[Bot Webhook] Received payload:', JSON.stringify(body).substring(0, 200) + '...');
    let { event, data } = body;

    // 2. Validate Payload (Goftino vs Test)
    if (event !== 'new_message' || !data) {
       if (body.content && body.userId) {
           data = {
               user_id: body.userId,
               content: body.content
           };
       } else {
           return NextResponse.json({ status: 'ignored', reason: 'invalid_event_type' });
       }
    }

    const user_id = data.user_id || data.userId; 
    const rawContent = data.content;
    const content = normalizePersian(rawContent);

    if (!user_id || !content) {
      return NextResponse.json({ status: 'ignored', reason: 'missing_fields' });
    }

    console.log('[Bot Logic] Processing:', user_id, 'Content:', content);

    const session = await getOrCreateSession(user_id);
    let responseText = '';

    // 3. Command Processing
    if (content === 'لغو' || content === 'cancel' || content === 'بازگشت') {
        await updateSession(user_id, { status: 'IDLE', context_data: {} });
        responseText = 'دستور لغو شد. چطور می‌توانم کمک کنم؟';
    }
    else if (session.status === 'IDLE') {
      if (content.includes('پیگیری') || content.includes('سفارش') || content.includes('status')) {
        if (session.user?.phone_number) {
          const orders = await prisma.order.findMany({
            where: { 
              user: { phone_number: session.user.phone_number },
              status: { not: 'COMPLETED' }
            },
            orderBy: { created_at: 'desc' },
            take: 5
          });

          if (orders.length === 0) {
            responseText = 'شما با شماره ' + session.user.phone_number + ' سفارش فعالی ندارید.';
          } else {
            responseText = 'سفارش‌های فعال شما:\n';
            for (const o of orders) {
              const pos = o.status === 'WAITING' ? await getQueuePosition(o.id) : '-';
              responseText += '- کد ' + o.wp_order_id + ': وضعیت ' + o.status + ' (نوبت: ' + pos + ')\n';
            }
          }
        } else {
          await updateSession(user_id, { status: 'AWAITING_PHONE' });
          responseText = 'لطفا شماره موبایل خود را وارد کنید:';
        }
      } else {
        const kbAnswer = await getKnowledgeAnswer(content);
        if (kbAnswer) {
          responseText = kbAnswer;
        } else {
          responseText = await generateAIResponse(content, "", []);
        }
      }
    } 
    else if (session.status === 'AWAITING_PHONE') {
      const phone = content.replace(/\D/g, ''); 
      if (phone.length >= 10) {
        await generateOtp(phone);
        await updateSession(user_id, { 
          status: 'AWAITING_OTP',
          context_data: { temp_phone: phone }
        });
        responseText = 'کد تایید به شماره ' + phone + ' ارسال شد. لطفا کد را وارد کنید:';
      } else {
        responseText = 'شماره موبایل معتبر نیست. لطفا مجدد تلاش کنید (یا "لغو" را ارسال کنید):';
      }
    }
    else if (session.status === 'AWAITING_OTP') {
      const contextData = session.context_data as any;
      const phone = contextData?.temp_phone;
      const isValid = await verifyOtp(phone, content);

      if (isValid) {
        await setSessionUser(user_id, phone);
        await updateSession(user_id, { 
          status: 'IDLE', 
          context_data: {} 
        });
        responseText = 'هویت شما تایید شد. چه کاری می‌توانم انجام دهم؟ (پیگیری سفارش / سوالات متداول)';
      } else {
        responseText = 'کد اشتباه است. لطفا مجدد تلاش کنید (یا "لغو" را ارسال کنید):';
      }
    }

    console.log('[Bot Logic] Reply Prepared:', responseText);

    // 4. Return Direct JSON Reply (Goftino Webhook Reply)
    // IMPORTANT: Goftino expects key "reply" in the response body.
    return NextResponse.json({ reply: responseText });

  } catch (error) {
    console.error('[Bot Logic] Critical Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
