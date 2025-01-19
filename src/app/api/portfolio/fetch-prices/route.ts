import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface PriceData {
  symbol: string;
  currentPrice: number;
  change24h: number;
  lastUpdated: string;
}

async function fetchCryptoPrice(symbol: string): Promise<PriceData | null> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`
    );
    const data = await response.json();
    const coinData = data[symbol.toLowerCase()];
    
    return {
      symbol,
      currentPrice: coinData.usd,
      change24h: coinData.usd_24h_change,
      lastUpdated: new Date(coinData.last_updated_at * 1000).toISOString()
    };
  } catch (error) {
    console.error(`Error fetching crypto price for ${symbol}:`, error);
    return null;
  }
}

async function fetchStockPrice(symbol: string): Promise<PriceData | null> {
  try {
    // In production, replace with actual Yahoo Finance API call
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
    );
    const data = await response.json();
    const quote = data.chart.result[0].meta;
    
    return {
      symbol,
      currentPrice: quote.regularMarketPrice,
      change24h: ((quote.regularMarketPrice - quote.previousClose) / quote.previousClose) * 100,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { assets } = await req.json();
    if (!assets || !Array.isArray(assets)) {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    const prices = await Promise.all(
      assets.map(async (asset) => {
        if (asset.type === 'crypto') {
          return fetchCryptoPrice(asset.symbol);
        } else if (asset.type === 'stock') {
          return fetchStockPrice(asset.symbol);
        }
        return null;
      })
    );

    const validPrices = prices.filter((price): price is PriceData => price !== null);

    return NextResponse.json({ prices: validPrices });
  } catch (error) {
    console.error('Error in fetch-prices:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}