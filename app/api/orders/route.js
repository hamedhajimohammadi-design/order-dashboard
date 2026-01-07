import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // اتصال استاندارد به دیتابیس ما

export const dynamic = 'force-dynamic'; // جلوگیری از کش شدن پاسخ

// 🛠️ تابع کمکی: تبدیل BigInt به String
// دیتابیس شما از BigInt استفاده می‌کند ولی JSON آن را نمی‌فهمد. این تابع مشکل را حل می‌کند.
const jsonWithBigInt = (data) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint'
      ? value.toString()
      : value
  ));
};

export async function GET(request) {
  try {
    // 1. خواندن پارامترهای URL (برای اینکه بتونی فیلتر کنی)
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); 
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // پیش‌فرض ۵۰ تا
    const sortBy = searchParams.get('sortBy') || 'order_date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // محاسبه پرش برای صفحه‌بندی
    const skip = (page - 1) * limit;

    // 2. ساخت شرط جستجو (Where Clause)
    let whereCondition = {};
    
    // فیلتر تاریخ (فقط سفارش‌های امروز به بعد)
    const fromToday = searchParams.get('fromToday') === 'true';
    
    if (fromToday) {
      // FIX: Show orders from Dec 31 2025 onwards
      const cutoffDate = new Date('2025-12-31T00:00:00.000Z');
      whereCondition.order_date = {
        gte: cutoffDate
      };
    }
    
    if (status && status !== 'all') {
      whereCondition.status = status;
    }

    // Map sortBy to Prisma fields
    let orderBy = [];
    
    // 1. Always show pinned orders first
    orderBy.push({ is_pinned: 'desc' });

    // 2. Then apply user selected sort
    if (sortBy === 'order_id') {
        orderBy.push({ wp_order_id: sortOrder });
    } else if (sortBy === 'updated') {
        orderBy.push({ updated_at: sortOrder });
    } else {
        orderBy.push({ order_date: sortOrder });
    }

    console.log(`⚡️ Reading from DB | Page: ${page} | Status: ${status || 'ALL'} | Sort: ${sortBy} ${sortOrder}`);

    // 3. دریافت سفارش‌ها از دیتابیس
    const orders = await prisma.order.findMany({
      where: whereCondition,
      take: limit,
      skip: skip,
      orderBy: orderBy,
      include: {
        user: true, 
      },
    });

    // 4. دریافت تعداد کل
    const totalCount = await prisma.order.count({ where: whereCondition });

    // 5. ارسال پاسخ
    return NextResponse.json({
      success: true,
      data: jsonWithBigInt(orders),
      pagination: {
        totalItems: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("❌ Database Error:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}