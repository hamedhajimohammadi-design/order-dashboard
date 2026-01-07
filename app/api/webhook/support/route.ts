import { handleBotRequest } from '@/lib/bot';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  return handleBotRequest(req);
}

export async function GET(req: Request) {
  return NextResponse.json({ status: 'ok', message: 'Support Bot Webhook is active' });
}
