import { handleBotRequest } from '../lib/bot';

async function runTest() {
  console.log('--- TEST START ---');
  // Mock Request - simulating "Order Status" in Persian
  const req = new Request('http://localhost:3000/api/webhook/support', {
    method: 'POST',
    body: JSON.stringify({
      event: 'new_message',
      data: {
        user_id: 'DEBUG_USER_' + Date.now(),
        content: 'پیگیری سفارش'
      }
    })
  });

  const res = await handleBotRequest(req);
  const json = await res.json();
  console.log('Response Status:', res.status);
  console.log('Response Body:', JSON.stringify(json, null, 2));
  console.log('--- TEST END ---');
}

runTest().catch(console.error);
