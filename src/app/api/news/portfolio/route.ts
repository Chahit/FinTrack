import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { symbols } = await request.json();
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return new NextResponse('Invalid symbols provided', { status: 400 });
    }

    // Fetch company news for each symbol
    const newsPromises = symbols.map(async (symbol) => {
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const response = await fetch(
        `https://finnhub.io/api/v1/company-news?symbol=${symbol}` +
        `&from=${oneMonthAgo.toISOString().split('T')[0]}` +
        `&to=${today.toISOString().split('T')[0]}` +
        `&token=${FINNHUB_API_KEY}`
      );

      if (!response.ok) {
        console.error(`Failed to fetch news for ${symbol}`);
        return [];
      }

      const data = await response.json();
      return data.map((item: any) => ({
        id: item.id,
        headline: item.headline,
        summary: item.summary,
        source: item.source,
        url: item.url,
        datetime: item.datetime,
        category: 'portfolio',
        related: symbol
      }));
    });

    const results = await Promise.all(newsPromises);
    
    // Combine all news items and remove duplicates
    const allNews = results.flat();
    const uniqueNews = Array.from(
      new Map(allNews.map(item => [item.headline, item])).values()
    );

    // Sort by datetime (most recent first)
    uniqueNews.sort((a, b) => b.datetime - a.datetime);

    return NextResponse.json(uniqueNews);
  } catch (error) {
    console.error('Portfolio news error:', error);
    return new NextResponse('Failed to fetch portfolio news', { status: 500 });
  }
} 