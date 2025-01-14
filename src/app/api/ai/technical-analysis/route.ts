import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { symbol } = await req.json();
    if (!symbol) {
      return NextResponse.json({ message: "Symbol is required" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a technical analyst providing detailed insights about stock market trends, patterns, and indicators."
        },
        {
          role: "user",
          content: `Provide a comprehensive technical analysis for ${symbol}, including key support/resistance levels, trend analysis, and trading recommendations.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return NextResponse.json({ 
      analysis: completion.choices[0].message.content,
      symbol 
    });
  } catch (error) {
    console.error('Technical analysis error:', error);
    return NextResponse.json({ message: "Error performing technical analysis" }, { status: 500 });
  }
}