import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { redis } from '@/lib/redis';
import { marketData } from '@/lib/market-data';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const interval = searchParams.get('interval') as '1min' | '5min' | '15min' | '30min' | '60min' | '1D' | 'daily';

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    // Try to get cached data first
    const cacheKey = `market:analysis:${userId}:${symbol}:${interval}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    const [quote, historicalData, technicalAnalysis, profile] = await Promise.all([
      marketData.getQuote(symbol),
      marketData.getHistoricalData(symbol, interval || '1D', 'compact'),
      marketData.getTechnicalAnalysis(symbol),
      marketData.getCompanyProfile(symbol),
    ]);

    const analysis = {
      timestamp: new Date().toISOString(),
      quote,
      historicalData,
      technicalAnalysis,
      profile,
    };

    // Cache the results for 5 minutes
    await redis.set(cacheKey, JSON.stringify(analysis), 'EX', 300);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Market analysis error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
