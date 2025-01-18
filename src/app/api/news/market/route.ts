import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

const NEWSAPI_KEY = process.env.NEXT_PUBLIC_NEWSAPI_KEY;
const MARKETAUX_KEY = process.env.NEXT_PUBLIC_MARKETAUX_API_KEY;

interface NewsItem {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedAt: string;
  category: string;
  source: string;
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'general';

    // Fetch from multiple sources in parallel
    const [newsApiData, marketAuxData, cryptoNews] = await Promise.all([
      // NewsAPI for general market news
      fetch(`https://newsapi.org/v2/everything?q=finance+market&language=en&sortBy=publishedAt&apiKey=${NEWSAPI_KEY}`)
        .then(res => res.ok ? res.json() : { articles: [] })
        .catch(() => ({ articles: [] })),

      // MarketAux for stock market news
      fetch(`https://api.marketaux.com/v1/news/all?api_token=${MARKETAUX_KEY}&filter_entities=true&language=en`)
        .then(res => res.ok ? res.json() : { data: [] })
        .catch(() => ({ data: [] })),

      // CoinGecko for crypto news
      fetch('https://api.coingecko.com/api/v3/news')
        .then(res => res.ok ? res.json() : [])
        .catch(() => [])
    ]);

    // Transform and combine news from different sources
    const transformedNews = [
      // Transform NewsAPI articles
      ...newsApiData.articles.map((item: any) => ({
        title: item.title,
        description: item.description || '',
        url: item.url,
        image: item.urlToImage,
        publishedAt: new Date(item.publishedAt).toISOString(),
        category: 'market',
        source: item.source.name
      })),

      // Transform MarketAux articles
      ...marketAuxData.data.map((item: any) => ({
        title: item.title,
        description: item.description || '',
        url: item.url,
        image: item.image_url,
        publishedAt: new Date(item.published_at).toISOString(),
        category: 'stock',
        source: item.source
      })),

      // Transform CoinGecko articles
      ...(Array.isArray(cryptoNews) ? cryptoNews : []).map((item: any) => ({
        title: item.title,
        description: item.description || '',
        url: item.url,
        image: item.thumb_image,
        publishedAt: new Date(item.published_at || Date.now()).toISOString(),
        category: 'crypto',
        source: item.author || 'CoinGecko'
      }))
    ];

    // Filter by category if specified
    let filteredNews = transformedNews;
    if (category !== 'all' && category !== 'general') {
      filteredNews = transformedNews.filter((item: NewsItem) => item.category === category);
    }

    // Sort by date (most recent first) and remove duplicates
    const uniqueNews = Array.from(
      new Map(filteredNews.map(item => [item.title, item])).values()
    ).sort((a: NewsItem, b: NewsItem) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // If no news found, return an empty array with a message
    if (uniqueNews.length === 0) {
      return NextResponse.json({
        articles: [],
        message: 'No recent market news found'
      });
    }

    return NextResponse.json({ articles: uniqueNews });
  } catch (error) {
    console.error('Market news error:', error);
    return new NextResponse('Failed to fetch market news', { status: 500 });
  }
} 