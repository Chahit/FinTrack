import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful financial assistant for the FinTrack application. You can:
1. Explain financial concepts and terms
2. Provide basic investment advice and strategies
3. Help users understand market trends
4. Explain different types of financial instruments
5. Offer risk management tips
6. Guide users on using the FinTrack application features

Always be clear that you're providing general information and not financial advice.
Keep responses concise and easy to understand.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return NextResponse.json({
      response: response.choices[0].message.content
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
