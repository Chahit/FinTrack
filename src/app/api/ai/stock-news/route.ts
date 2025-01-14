import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Mock news data - In production, integrate with a real news API
    const news = [
      {
        id: 1,
        title: "Market Rally Continues as Tech Stocks Surge",
        summary: "Major tech companies lead market gains amid positive earnings reports",
        source: "Financial Times",
        url: "https://example.com/news/1",
        sentiment: "positive",
        timestamp: new Date().toISOString(),
        relatedSymbols: ["AAPL", "MSFT", "GOOGL"]
      },
      {
        id: 2,
        title: "Federal Reserve Signals Interest Rate Strategy",
        summary: "Fed chairman discusses future monetary policy direction",
        source: "Reuters",
        url: "https://example.com/news/2",
        sentiment: "neutral",
        timestamp: new Date().toISOString(),
        relatedSymbols: ["SPY", "QQQ"]
      },
      {
        id: 3,
        title: "Crypto Market Faces Regulatory Challenges",
        summary: "New regulations impact cryptocurrency trading volumes",
        source: "Bloomberg",
        url: "https://example.com/news/3",
        sentiment: "negative",
        timestamp: new Date().toISOString(),
        relatedSymbols: ["BTC", "ETH"]
      }
    ];

    return NextResponse.json({
      news,
      marketSummary: {
        sentiment: "bullish",
        keyTrends: [
          "Tech sector outperformance",
          "Rising interest rates impact",
          "Regulatory developments"
        ],
        tradingVolume: "Above average",
        marketMomentum: "Strong"
      }
    });
  } catch (error) {
    console.error('Stock news error:', error);
    return NextResponse.json({ message: "Error fetching stock news" }, { status: 500 });
  }
}

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
          content: "You are a financial news analyst providing insights about market news and their potential impact on stocks."
        },
        {
          role: "user",
          content: `Analyze recent news and market sentiment for ${symbol}. Include key events, market reactions, and potential future impacts.`
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
    console.error('Stock news analysis error:', error);
    return NextResponse.json({ message: "Error analyzing stock news" }, { status: 500 });
  }
}