
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rules = await prisma.categoryRule.findMany({
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json({ success: true, data: rules });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch rules' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, keywords, est_time, difficulty } = body;
    
    const rule = await prisma.categoryRule.create({
      data: {
        name,
        keywords,
        est_time: parseInt(est_time),
        difficulty: parseInt(difficulty)
      }
    });
    
    return NextResponse.json({ success: true, data: rule });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create rule' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, keywords, est_time, difficulty } = body;
    
    const rule = await prisma.categoryRule.update({
      where: { id: parseInt(id) },
      data: {
        name,
        keywords,
        est_time: parseInt(est_time),
        difficulty: parseInt(difficulty)
      }
    });
    
    return NextResponse.json({ success: true, data: rule });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update rule' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    await prisma.categoryRule.delete({
      where: { id: parseInt(id) }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete rule' }, { status: 500 });
  }
}
