import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { Prisma } from '.prisma/client';
import { getCurrentPrice } from '@/lib/price-service';

type Asset = {
  id: string;
  symbol: string;
  type: 'crypto' | 'stock';
  quantity: number;
  purchasePrice: number;
  purchaseDate: Date;
  notes?: string;
  portfolioId: string;
  createdAt: Date;
  updatedAt: Date;
};

interface AssetWithPrice {
  id: string;
  symbol: string;
  type: 'crypto' | 'stock';
  amount: number;
  currentPrice: number;
  priceChange24h: number;
}

export async function GET() {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // First get the user's portfolio
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        userId: userId
      },
      include: {
        assets: true
      }
    });

    // If no portfolio or assets found, return empty data
    if (!portfolio || !portfolio.assets || portfolio.assets.length === 0) {
      return NextResponse.json({
        assets: [],
        totalValue: 0,
        dailyChange: 0
      });
    }

    // Get current prices for all assets
    const assets = await Promise.all(portfolio.assets.map(async (asset: Asset) => {
      try {
        const currentPrice = await getCurrentPrice(asset.symbol, asset.type);
        if (!currentPrice) {
          throw new Error(`No price data available for ${asset.symbol}`);
        }

        return {
          id: asset.id,
          symbol: asset.symbol,
          type: asset.type,
          amount: asset.quantity,
          currentPrice,
          priceChange24h: ((currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100
        };
      } catch (error) {
        console.error(`Error fetching price for ${asset.symbol}:`, error);
        // Fallback to purchase price if price fetch fails
        return {
          id: asset.id,
          symbol: asset.symbol,
          type: asset.type,
          amount: asset.quantity,
          currentPrice: asset.purchasePrice,
          priceChange24h: 0
        };
      }
    }));

    // Calculate total value and daily change
    let totalValue = 0;
    let totalPreviousValue = 0;

    assets.forEach((asset: AssetWithPrice) => {
      const currentValue = asset.amount * asset.currentPrice;
      const previousValue = asset.amount * (asset.currentPrice / (1 + (asset.priceChange24h || 0) / 100));
      
      totalValue += currentValue;
      totalPreviousValue += previousValue;
    });

    const dailyChange = totalValue - totalPreviousValue;

    // Format response
    const portfolioData = {
      assets,
      totalValue,
      dailyChange
    };

    return NextResponse.json(portfolioData);

  } catch (error) {
    console.error('Portfolio API Error:', error);
    
    // Handle Prisma errors with proper type checking
    if (
      error instanceof Error &&
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return NextResponse.json({ error: 'Database constraint violation' }, { status: 400 });
    }
    
    if (
      error instanceof Error &&
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}