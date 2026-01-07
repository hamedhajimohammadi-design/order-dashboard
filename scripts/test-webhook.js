const axios = require('axios');

async function run() {
    try {
        console.log("Posting to Webhook...");
        const res = await axios.post('http://localhost:3000/api/webhooks/support', {
            event: 'new_message',
            data: {
                user_id: '695c1dee3a6308f883228f3342a55b69495e578bb2ef08019b864d4a9635bc4d',
                content: 'پیگیری سفارش'
            }
        });
        console.log("Status:", res.status);
        console.log("Data:", JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.log("Error:", e.message);
        if (e.response) {
            console.log("Response Data:", e.response.data);
        }
    }
}
run();
