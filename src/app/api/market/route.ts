import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { marketData } from '@/lib/market-data';
import { withRateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const type = searchParams.get('type') || 'quote';

    if (!symbol) {
      return NextResponse.json({ message: "Symbol is required" }, { status: 400 });
    }

    const rateLimitResponse = await withRateLimit(req, 'fmp');
    if (rateLimitResponse) return rateLimitResponse;

    let data;
    switch (type) {
      case 'quote':
        data = await marketData.getQuote(symbol);
        break;
      case 'profile':
        data = await marketData.getCompanyProfile(symbol);
        break;
      case 'historical':
        data = await marketData.getHistoricalData(symbol);
        break;
      case 'news':
        data = await marketData.getMarketNews(symbol);
        break;
      default:
        return NextResponse.json({ message: "Invalid data type" }, { status: 400 });
    }

    await prisma.search.create({
      data: {
        userId,
        symbol,
        type,
        timestamp: new Date()
      }
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Market data error:', error);
    return NextResponse.json({
      message: "Error fetching market data",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { symbols } = await req.json();

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json({ message: "Symbols array is required" }, { status: 400 });
    }

    const rateLimitResponse = await withRateLimit(req, 'fmp');
    if (rateLimitResponse) return rateLimitResponse;

    const quotes = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const quote = await marketData.getQuote(symbol);
          
          await prisma.search.create({
            data: {
              userId,
              symbol,
              type: 'quote',
              timestamp: new Date()
            }
          });

          return quote;
        } catch (error) {
          console.error(`Error fetching quote for ${symbol}:`, error);
          return null;
        }
      })
    );

    return NextResponse.json(quotes.filter(Boolean));
  } catch (error) {
    console.error('Batch quotes error:', error);
    return NextResponse.json({
      message: "Error fetching batch quotes",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { symbol, type } = await req.json();

    if (!symbol || !type) {
      return NextResponse.json({ message: "Symbol and type are required" }, { status: 400 });
    }

    await prisma.search.create({
      data: {
        userId,
        symbol,
        type,
        timestamp: new Date()
      }
    });

    return NextResponse.json({ message: "Search recorded successfully" });
  } catch (error) {
    console.error('Record search error:', error);
    return NextResponse.json({
      message: "Error recording search",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}