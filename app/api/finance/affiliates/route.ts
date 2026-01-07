import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const affiliates = await prisma.affiliate.findMany({
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json({ success: true, data: affiliates });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, owner_name, commission_percent } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 });
    }

    const affiliate = await prisma.affiliate.upsert({
      where: { code },
      update: {
        owner_name,
        commission_percent: parseFloat(commission_percent)
      },
      create: {
        code,
        owner_name,
        commission_percent: parseFloat(commission_percent)
      }
    });

    return NextResponse.json({ success: true, data: affiliate });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
