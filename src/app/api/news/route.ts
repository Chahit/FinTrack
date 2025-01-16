import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { config } from '@/lib/config';

const FINNHUB_API_BASE = 'https://finnhub.io/api/v1';
const COINGECKO_NEWS_API = 'https://api.coingecko.com/api/v3/news';

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'general';

    let newsData;

    if (category === 'crypto') {
      // Use CoinGecko for crypto news
      const response = await fetch(COINGECKO_NEWS_API);
      if (!response.ok) throw new Error('Failed to fetch crypto news');
      const data = await response.json();
      
      // Transform CoinGecko news format to match our app's format
      newsData = data.map((item: any) => ({
        id: item.id,
        headline: item.title,
        summary: item.description,
        url: item.url,
        datetime: new Date(item.created_at).getTime() / 1000,
        category: 'crypto',
        source: item.author,
        related: item.categories.join(', '),
      }));
    } else {
      // Use Finnhub for other categories
      const response = await fetch(
        `${FINNHUB_API_BASE}/news?category=${category}`,
        {
          headers: {
            'X-Finnhub-Token': config.finnhub.apiKey
          },
          next: { revalidate: 300 } // Cache for 5 minutes
        }
      );

      if (!response.ok) throw new Error('Failed to fetch news');
      newsData = await response.json();
    }

    return NextResponse.json(newsData);
  } catch (error) {
    console.error('News fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, content, url, source, symbols, sentiment } = await req.json();

    const news = await prisma.news.create({
      data: {
        title,
        content,
        url,
        source,
        symbols,
        sentiment,
        createdAt: new Date()
      }
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error('News creation error:', error);
    return NextResponse.json({ message: "Error creating news" }, { status: 500 });
  }
}
