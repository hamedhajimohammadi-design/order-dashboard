import { NextResponse } from 'next/server';
import bot from '@/lib/telegram-bot';

const SECRET_TOKEN = process.env.TELEGRAM_WEBHOOK_SECRET;

export async function POST(req: Request) {
    try {
        const token = req.headers.get('x-telegram-bot-api-secret-token');
        if (SECRET_TOKEN && token !== SECRET_TOKEN) {
             return NextResponse.json({ status: 'Unauthorized' }, { status: 401 });
        }
        
        const body = await req.json();
        await bot.handleUpdate(body);

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Telegram Error:', error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}