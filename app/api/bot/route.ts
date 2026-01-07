import { handleBotRequest } from '@/lib/bot';

export async function POST(req: Request) {
  return handleBotRequest(req);
}
