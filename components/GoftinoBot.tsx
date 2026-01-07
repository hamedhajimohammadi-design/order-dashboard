'use client';

import { useEffect } from 'react';

export default function GoftinoBot() {
  useEffect(() => {
    const handleSendMessage = async (e: any) => {
      // e.detail contains the message info
      const { type, content } = e.detail;
      
      // Only process text messages
      if (type !== 'text') return;

      try {
        // @ts-ignore
        const userId = window.Goftino?.getUserId();
        
        if (!userId) return;

        // Call our server-side bot logic
        const res = await fetch('/api/bot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, userId }),
        });

        const data = await res.json();

        if (data.reply) {
          // Display the bot's reply in the widget
          // @ts-ignore
          window.Goftino?.sendMessage({
            text: data.reply
          });
        }
      } catch (error) {
        console.error('Bot Error:', error);
      }
    };

    // Listen for messages sent by the user
    window.addEventListener('goftino_sendMessage', handleSendMessage);

    return () => {
      window.removeEventListener('goftino_sendMessage', handleSendMessage);
    };
  }, []);

  return null;
}
