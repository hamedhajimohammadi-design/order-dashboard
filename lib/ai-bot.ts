
import OpenAI from 'openai';
import { getSystemPrompt } from './bot-knowledge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAIResponse(userMessage: string, orderContext: any) {
  try {
    const contextString = `
      Order Status: ${orderContext.status}
      Order ID: ${orderContext.wp_order_id}
      User Name: ${orderContext.user?.first_name || 'Customer'}
      Queue Position: ${orderContext.queuePosition || 'N/A'}
      Estimated Time: ${orderContext.estTime || 'N/A'} minutes
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Or gpt-3.5-turbo if 4o is not available/too expensive
      messages: [
        { role: "system", content: getSystemPrompt() },
        { role: "system", content: `Current Order Context:\n${contextString}` },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return null; // Fallback to rule-based if AI fails
  }
}
