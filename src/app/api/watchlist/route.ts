import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const watchlist = await prisma.watchlist.findFirst({
      where: { userId },
      include: {
        stocks: {
          orderBy: {
            addedAt: 'desc'
          }
        }
      }
    });

    if (!watchlist) {
      return NextResponse.json(
        { error: 'Watchlist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      watchlist,
      metadata: {
        count: watchlist.stocks.length,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Watchlist route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol, notes } = await request.json();

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    const watchlist = await prisma.watchlist.upsert({
      where: { userId },
      create: {
        userId,
        stocks: {
          create: {
            symbol,
            notes,
            addedAt: new Date()
          }
        }
      },
      update: {
        stocks: {
          create: {
            symbol,
            notes,
            addedAt: new Date()
          }
        }
      },
      include: {
        stocks: true
      }
    });

    return NextResponse.json({
      watchlist,
      message: 'Stock added to watchlist successfully'
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    return NextResponse.json(
      { error: 'Failed to add stock to watchlist' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stockId, notes } = await request.json();

    if (!stockId) {
      return NextResponse.json(
        { error: 'Stock ID is required' },
        { status: 400 }
      );
    }

    const stock = await prisma.watchlistStock.update({
      where: {
        id: stockId,
        watchlist: {
          userId
        }
      },
      data: {
        notes,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      stock,
      message: 'Watchlist stock updated successfully'
    });
  } catch (error) {
    console.error('Update watchlist stock error:', error);
    return NextResponse.json(
      { error: 'Failed to update watchlist stock' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stockId = searchParams.get('stockId');

    if (!stockId) {
      return NextResponse.json(
        { error: 'Stock ID is required' },
        { status: 400 }
      );
    }

    await prisma.watchlistStock.delete({
      where: {
        id: stockId,
        watchlist: {
          userId
        }
      }
    });

    return NextResponse.json({
      message: 'Stock removed from watchlist successfully'
    });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    return NextResponse.json(
      { error: 'Failed to remove stock from watchlist' },
      { status: 500 }
    );
  }
}
