import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

interface NewsItem {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedAt: string;
  category: string;
  source: string;
}

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

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

    if (!ALPHA_VANTAGE_API_KEY) {
      console.error('Alpha Vantage API key not configured');
      return new NextResponse('API configuration error', { status: 500 });
    }

    // Fetch news for all symbols
    const newsPromises = symbols.map(async (symbol) => {
      try {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch news for ${symbol}`);
        }

        const data = await response.json();
        const articles = data.feed || [];

        return articles.map((article: any) => ({
          title: article.title,
          description: article.summary,
          url: article.url,
          image: article.banner_image,
          publishedAt: new Date(article.time_published).toISOString(),
          category: symbol.match(/^(BTC|ETH|SOL|ADA|AVAX|XRP|DOT|DOGE)$/i) ? 'crypto' : 'stock',
          source: article.source
        }));
      } catch (error) {
        console.error(`Error fetching news for ${symbol}:`, error);
        return [];
      }
    });

    const results = await Promise.all(newsPromises);
    
    // Combine all news items and remove duplicates
    const allNews = results.flat();
    const uniqueNews = Array.from(
      new Map(allNews.map(item => [item.title, item])).values()
    );

    // Sort by publishedAt (most recent first)
    uniqueNews.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // If no news found, return an empty array with a message
    if (uniqueNews.length === 0) {
      return NextResponse.json({
        articles: [],
        message: 'No recent news found for your portfolio assets'
      });
    }

    return NextResponse.json({ articles: uniqueNews });
  } catch (error) {
    console.error('Portfolio news error:', error);
    return new NextResponse('Failed to fetch portfolio news', { status: 500 });
  }
} 