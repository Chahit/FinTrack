import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

const STOCK_SYMBOLS = [
  'AAPL',  // Apple
  'MSFT',  // Microsoft
  'GOOGL', // Alphabet
  'AMZN',  // Amazon
  'META',  // Meta
  'NVDA',  // NVIDIA
  'TSLA',  // Tesla
  'JPM',   // JPMorgan Chase
  'V',     // Visa
  'WMT'    // Walmart
];

export async function GET() {
  try {
    const promises = STOCK_SYMBOLS.map(async (symbol) => {
      try {
        const response = await fetch(
          `${config.finnhub.baseUrl}/quote?symbol=${symbol}&token=${config.finnhub.apiKey}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            next: { revalidate: 10 }, // Cache for 10 seconds
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch data for ${symbol}`);
        }

        const data = await response.json();
        
        return {
          symbol,
          price: data.c || 0, // Current price
          change: data.d || 0, // Daily change
          changePercent: data.dp || 0, // Daily percent change
          bid: data.b || null, // Bid price
          ask: data.a || null  // Ask price
        };
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
        return {
          symbol,
          price: 0,
          change: 0,
          changePercent: 0,
          bid: null,
          ask: null
        };
      }
    });

    const stocks = await Promise.all(promises);
    return NextResponse.json(stocks);
  } catch (error) {
    console.error('Error in stock ticker API:', error);
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
  }
} 