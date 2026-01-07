
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.expense.count()
    ]);

    return NextResponse.json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received Expense Body:", body); // لاگ برای دیباگ

    const { title, amount, category, type, date, due_date, is_paid, description } = body;

    if (!title || !amount) {
      return NextResponse.json({ error: "Title and Amount are required" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        amount: amount, // Prisma Decimal accepts string/number
        category,
        type,
        date: new Date(date),
        due_date: due_date ? new Date(due_date) : null,
        is_paid: is_paid ?? true,
        description
      }
    });

    return NextResponse.json({ success: true, data: expense });
  } catch (error) {
    console.error("Create Expense Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, is_paid, date } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updateData = {};
    if (is_paid !== undefined) updateData.is_paid = is_paid;
    if (date) updateData.date = new Date(date);

    const expense = await prisma.expense.update({
      where: { id: Number(id) },
      data: updateData
    });

    return NextResponse.json({ success: true, data: expense });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
