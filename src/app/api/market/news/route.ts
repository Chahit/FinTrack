import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { marketData } from '@/lib/market-data';

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const news = await marketData.getMarketNews();
    
    // Transform the news data to match our application's format
    const formattedNews = news.map((item: any) => ({
      id: item.id.toString(),
      title: item.headline,
      summary: item.summary,
      url: item.url,
      source: item.source,
      publishedAt: new Date(item.datetime * 1000).toISOString(),
      topics: [item.category, item.related].filter(Boolean),
      sentiment: item.sentiment || 'neutral'
    }));

    return NextResponse.json(formattedNews);
  } catch (error) {
    console.error('Market news API error:', error);
    return new NextResponse('Failed to fetch market news', { status: 500 });
  }
}
