const axios = require('axios');

const API_KEY = "699148628gevb83yy3n7m0o1574c60d08dd367351c3b2cacb49b9d260ee7a20d";
const USER_ID = "695c1dee3a6308f883228f3342a55b69495e578bb2ef08019b864d4a9635bc4d";

async function testDirectSend() {
    console.log("--- TEST 1: Direct Send to Goftino API ---");
    try {
        const payload = {
            user_id: USER_ID,
            content: "Test Message from Critical Debugger at " + new Date().toLocaleTimeString()
        };

        console.log("Sending payload:", payload);
        
        const res = await axios.post('https://api.goftino.com/v1/messages', payload, {
            headers: {
                'Content-Type': 'application/json',
                'goftino-token': API_KEY
            }
        });
        
        console.log("✅ SUCCESS: Goftino API accepted the message.");
        console.log("Response data:", res.data);
    } catch (error) {
        console.log("❌ FAILED: Goftino API rejected the request.");
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);
        } else {
            console.log("Error:", error.message);
        }
    }
}

async function run() {
    await testDirectSend();
}

run();
