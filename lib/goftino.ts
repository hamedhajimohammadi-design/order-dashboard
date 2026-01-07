import axios from 'axios';

const GOFTINO_API_KEY = process.env.GOFTINO_API_KEY;
const GOFTINO_OPERATOR_ID = process.env.GOFTINO_OPERATOR_ID || "64e8ed8915e2e32bff4c4953"; 

export async function sendGoftinoMessage(chatId: string, text: string) {
  if (!GOFTINO_API_KEY) {
    console.error('❌ GOFTINO_API_KEY is missing!');
    return;
  }
  try {
    const res = await axios.post('https://api.goftino.com/v1/send_message', {
      chat_id: chatId,
      operator_id: GOFTINO_OPERATOR_ID,
      message: text
    }, {
      headers: { 
        'goftino-key': GOFTINO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    return res.data;
  } catch (error: any) {
    console.error('❌ Error sending Goftino message:', error.response?.data || error.message);
  }
}
