import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (apiKey) {
  openai = new OpenAI({
    apiKey: apiKey,
  });
} else {
  console.warn("⚠️ OPENAI_API_KEY is missing. AI features will be disabled.");
}

export type Intent = 'TRACKING' | 'CORRECTION' | 'GUIDE' | 'PRICE_STOCK' | 'HUMAN_NEEDED' | 'GREETING' | 'UNKNOWN';

export async function analyzeIntent(message: string, userSegment: string = 'NEWBIE'): Promise<{ intent: Intent; confidence: number; entities: any }> {
  if (!openai) return { intent: 'UNKNOWN', confidence: 0, entities: {} };

  try {
    const systemPrompt = `
      You are the AI Brain of PGem Shop. Your job is to classify the User Intent.
      User Segment: ${userSegment}
      
      Intents:
      - TRACKING: Asking about order status, "where is my order", "queue", "nobaat".
      - CORRECTION: Wants to change info, "wrong uid", "wrong password", "edit order".
      - GUIDE: How to buy, how to find UID, tutorial.
      - PRICE_STOCK: Price of CP, is X available?
      - HUMAN_NEEDED: Angry, complaint, complex issue, "connect to operator".
      - GREETING: Hello, Hi, Thanks.
      
      Output JSON only: { "intent": "...", "confidence": 0.0-1.0, "entities": { "order_id": "...", "phone": "..." } }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    return content ? JSON.parse(content) : { intent: 'UNKNOWN', confidence: 0, entities: {} };

  } catch (error) {
    console.error("AI Intent Error:", error);
    return { intent: 'UNKNOWN', confidence: 0, entities: {} };
  }
}

export async function generateAIResponse(
  message: string, 
  context: string, 
  history: { role: 'user' | 'assistant', content: string }[]
): Promise<string> {
  if (!openai) return "سیستم هوشمند در حال حاضر در دسترس نیست.";

  try {
    const systemPrompt = `
      You are the PGem Shop Support Assistant.
      Tone: Friendly, Professional, Concise. Persian Language.
      
      Context Info:
      ${context}
      
      Rules:
      1. If you don't know, say "I'll connect you to an operator".
      2. Keep answers short (under 3 sentences if possible).
      3. Do not hallucinate order statuses. Use the Context Info provided.
    `;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...history.slice(-4), // Keep last 4 messages for context
      { role: "user", content: message }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.5,
    });

    return response.choices[0].message.content || "متوجه نشدم، لطفا دوباره بگویید.";

  } catch (error) {
    console.error("AI Reply Error:", error);
    return "در حال حاضر سیستم پاسخگویی دچار اختلال شده است. لطفا منتظر اپراتور بمانید.";
  }
}
