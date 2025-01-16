import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'general';
    const sentiment = searchParams.get('sentiment') || 'all';
    const search = searchParams.get('search') || '';

    // Fetch market news from Finnhub
    const response = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Finnhub');
    }

    const newsData = await response.json();

    // Transform and filter the news data
    let transformedNews = newsData.map((item: any) => ({
      id: item.id,
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      datetime: item.datetime,
      category: item.category || 'general',
      related: item.related || ''
    }));

    // Apply filters
    if (category !== 'general') {
      transformedNews = transformedNews.filter((item: any) => 
        item.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      transformedNews = transformedNews.filter((item: any) =>
        item.headline.toLowerCase().includes(searchLower) ||
        item.summary.toLowerCase().includes(searchLower)
      );
    }

    // Sort by datetime (most recent first)
    transformedNews.sort((a: any, b: any) => b.datetime - a.datetime);

    return NextResponse.json(transformedNews);
  } catch (error) {
    console.error('Market news error:', error);
    return new NextResponse('Failed to fetch market news', { status: 500 });
  }
} 