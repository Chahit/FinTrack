import { NextRequest, NextResponse } from 'next/server';

const COINGECKO_IDS: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'AVAX': 'avalanche-2',
  'ADA': 'cardano',
} as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const { symbol } = params;
    const coinId = COINGECKO_IDS[symbol as keyof typeof COINGECKO_IDS];
    
    if (!coinId) {
      return NextResponse.json(
        { error: `Unsupported cryptocurrency: ${symbol}` },
        { status: 400 }
      );
    }

    const endpoint = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&precision=4`;

    console.log(`Fetching crypto data from CoinGecko for ${coinId}`);

    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      next: {
        revalidate: 30 // Cache for 30 seconds
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CoinGecko API error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch data for ${coinId}: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data[coinId]) {
      console.error(`No data received for ${coinId}:`, data);
      throw new Error(`No data available for ${coinId}`);
    }

    // Transform CoinGecko data to match our expected format
    const price = data[coinId].usd;
    const change = data[coinId].usd_24h_change || 0;

    if (typeof price !== 'number') {
      throw new Error(`Invalid price data for ${coinId}`);
    }

    // Return in a format similar to what we were using before
    return NextResponse.json({
      c: price,
      d: (price * (change / 100)), // Convert percentage change to absolute change
      dp: change,
    });
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch crypto data',
        c: null,
        d: null,
        dp: null
      },
      { status: 500 }
    );
  }
} 