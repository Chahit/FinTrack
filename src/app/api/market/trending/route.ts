import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

async function fetchCryptoTrending() {
  const response = await fetch('https://api.coingecko.com/api/v3/search/trending');
  const data = await response.json();
  return data.coins.slice(0, 5).map((coin: any) => ({
    id: coin.item.id,
    name: coin.item.name,
    symbol: coin.item.symbol,
    type: 'crypto',
    price_change_24h: coin.item.price_btc,
    thumb: coin.item.thumb
  }));
}

async function fetchStockTrending() {
  // Fetch trending stocks from Yahoo Finance API
  const trendingSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA'];
  const promises = trendingSymbols.map(async (symbol) => {
    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
      );
      const data = await response.json();
      const quote = data.chart.result[0].meta;
      
      return {
        id: symbol,
        name: quote.shortName || symbol,
        symbol: symbol,
        type: 'stock',
        price_change_24h: ((quote.regularMarketPrice - quote.previousClose) / quote.previousClose) * 100
      };
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter((result): result is NonNullable<typeof result> => result !== null);
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [cryptoTrending, stockTrending] = await Promise.all([
      fetchCryptoTrending(),
      fetchStockTrending()
    ]);

    return NextResponse.json({
      crypto: cryptoTrending,
      stocks: stockTrending
    });
  } catch (error) {
    console.error('Error fetching trending assets:', error);
    return NextResponse.json({ message: "Error fetching trending data" }, { status: 500 });
  }
}