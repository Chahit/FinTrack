import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert financial advisor and market analyst AI assistant. Your role is to:

1. Analyze market trends and provide insights
2. Assess investment risks and opportunities
3. Provide portfolio recommendations
4. Explain complex financial concepts
5. Monitor market sentiment and news impact

Use real-time market data when available and always provide well-reasoned, data-driven advice.
Be clear about the speculative nature of investments and include appropriate risk disclaimers.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({
      response: response.choices[0].message.content
    });
  } catch (error) {
    console.error('Error in finance agent:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
