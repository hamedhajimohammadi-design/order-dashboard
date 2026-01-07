const axios = require('axios');

const API_KEY = '699148628gevb83yy3n7m0o1574c60d08dd367351c3b2cacb49b9d260ee7a20d';
const USER_ID = '695c1dee3a6308f883228f3342a55b69495e578bb2ef08019b864d4a9635bc4d';

async function test(payload) {
    try {
        console.log('Testing payload:', JSON.stringify(payload));
        const res = await axios.post('https://api.goftino.com/v1/messages', payload, {
            headers: {
                'Content-Type': 'application/json',
                'goftino-token': API_KEY
            }
        });
        console.log('SUCCESS (token):', res.data);
    } catch (err) {
        console.log('ERROR (token):', err.response ? err.response.data : err.message);
    }

    try {
        console.log('Testing payload (key):', JSON.stringify(payload));
        const res = await axios.post('https://api.goftino.com/v1/messages', payload, {
            headers: {
                'Content-Type': 'application/json',
                'goftino-key': API_KEY
            }
        });
        console.log('SUCCESS (key):', res.data);
    } catch (err) {
        console.log('ERROR (key):', err.response ? err.response.data : err.message);
    }
}

async function run() {
    await test({ user_id: USER_ID, content: 'Test content', type: 'text' });
    await test({ user_id: USER_ID, text: 'Test text', type: 'text' });
    await test({ session_id: USER_ID, content: 'Test content', type: 'text' });
    await test({ id: USER_ID, content: 'Test content' });
    await test({ peer_id: USER_ID, content: 'Test content' });
}

run();
