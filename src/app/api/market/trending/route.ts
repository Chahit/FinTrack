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
  // You would implement this with a real stock API
  // This is a mock implementation
  return [
    { id: 'AAPL', name: 'Apple Inc', symbol: 'AAPL', type: 'stock', price_change_24h: 2.5 },
    { id: 'MSFT', name: 'Microsoft', symbol: 'MSFT', type: 'stock', price_change_24h: 1.8 },
    { id: 'GOOGL', name: 'Alphabet', symbol: 'GOOGL', type: 'stock', price_change_24h: -0.5 },
  ];
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