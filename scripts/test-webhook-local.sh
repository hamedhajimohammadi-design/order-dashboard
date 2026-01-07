#!/bin/bash
# Test Webhook Local

# 1. Telegram
echo "Testing Telegram Webhook (Order Tracking)..."
curl -X POST http://127.0.0.1:3000/api/webhook/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "update_id": 123456,
    "message": {
      "message_id": 100,
      "from": { "id": 11223344, "first_name": "TestUser", "username": "tester" },
      "chat": { "id": 11223344, "type": "private" },
      "date": 1672531200,
      "text": "50577"
    }
  }'

echo -e "\n\nTesting Goftino Webhook (New structure)..."
curl -X POST http://127.0.0.1:3000/api/webhook/goftino \
  -H "Content-Type: application/json" \
  -d '{
    "event": "new_message",
    "data": {
        "chat_id": "goftino_session_999",
        "content": "سلام سفارش 50577 چی شد؟",
        "sender": { "from": "user" }
    }
  }'

echo -e "\nDone."
