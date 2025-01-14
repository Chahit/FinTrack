import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import OpenAI from 'openai';
import clientPromise from '@/lib/mongodb';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("fintrack");
    const portfolio = await db.collection("portfolios").findOne({ userId });

    if (!portfolio) {
      return NextResponse.json({ message: "Portfolio not found" }, { status: 404 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a financial advisor analyzing investment portfolios. Provide insights on portfolio composition, risk assessment, and recommendations for improvement."
        },
        {
          role: "user",
          content: `Analyze this portfolio and provide detailed insights: ${JSON.stringify(portfolio.assets)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return NextResponse.json({ 
      analysis: completion.choices[0].message.content,
      portfolio: portfolio.assets 
    });
  } catch (error) {
    console.error('Portfolio analysis error:', error);
    return NextResponse.json({ message: "Error analyzing portfolio" }, { status: 500 });
  }
}