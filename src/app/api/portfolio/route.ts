import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

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
        assets: {
          select: {
            id: true,
            symbol: true,
            type: true,
            quantity: true, // This is the amount field in our schema
            purchasePrice: true,
            createdAt: true,
            updatedAt: true
          }
        }
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
    const assets = await Promise.all(portfolio.assets.map(async (asset) => {
      // For demonstration, using purchase price as current price
      // In production, you would fetch real-time prices here
      const currentPrice = asset.purchasePrice;
      const priceChange24h = 0; // This would come from your price service

      return {
        id: asset.id,
        symbol: asset.symbol,
        type: asset.type,
        amount: asset.quantity,
        currentPrice: currentPrice,
        priceChange24h: priceChange24h
      };
    }));

    // Calculate total value and daily change
    let totalValue = 0;
    let totalPreviousValue = 0;

    assets.forEach(asset => {
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
    
    // Handle specific database errors
    if (error.code === 'P2002') {
      return new NextResponse('Database constraint violation', { status: 400 });
    }
    
    if (error.code === 'P2025') {
      return new NextResponse('Record not found', { status: 404 });
    }

    return new NextResponse(
      'Failed to fetch portfolio data',
      { status: 500 }
    );
  }
}