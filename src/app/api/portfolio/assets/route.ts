import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getCurrentPrice } from '@/lib/price-service';

// Schema for asset validation
const assetSchema = z.object({
  symbol: z.string().min(1),
  type: z.enum(['crypto', 'stock']),
  quantity: z.number().positive(),
  purchasePrice: z.number().positive(),
  purchaseDate: z.string().datetime(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = assetSchema.parse(body);

    // Get or create portfolio for user
    const portfolio = await prisma.portfolio.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    // Create new asset
    const asset = await prisma.asset.create({
      data: {
        portfolioId: portfolio.id,
        symbol: validatedData.symbol,
        type: validatedData.type,
        quantity: validatedData.quantity,
        purchasePrice: validatedData.purchasePrice,
        purchaseDate: new Date(validatedData.purchaseDate),
        notes: validatedData.notes,
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        portfolioId: portfolio.id,
        assetId: asset.id,
        type: 'BUY',
        quantity: validatedData.quantity,
        price: validatedData.purchasePrice,
        date: new Date(validatedData.purchaseDate),
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('POST /api/portfolio/assets error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        assets: {
          include: {
            transactions: true,
          },
          orderBy: {
            purchaseDate: 'desc',
          },
        },
      },
    });

    if (!portfolio) {
      return NextResponse.json({ 
        assets: [],
        summary: {
          totalValue: 0,
          totalGainLoss: 0,
          totalAssets: 0,
          totalGainLossPercentage: 0
        },
        allocation: []
      });
    }

    // Fetch current prices and calculate metrics for each asset
    const assetsWithMetrics = await Promise.all(portfolio.assets.map(async (asset) => {
      try {
        const currentPrice = await getCurrentPrice(asset.symbol, asset.type as 'crypto' | 'stock');
        const totalInvested = asset.quantity * asset.purchasePrice;
        const currentValue = asset.quantity * currentPrice;
        const gainLoss = currentValue - totalInvested;
        const gainLossPercentage = (gainLoss / totalInvested) * 100;

        return {
          ...asset,
          metrics: {
            totalInvested,
            currentValue,
            gainLoss,
            gainLossPercentage,
            currentPrice,
            priceChange24h: ((currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100
          }
        };
      } catch (error) {
        console.error(`Error fetching price for ${asset.symbol}:`, error);
        // Fallback to purchase price if current price fetch fails
        return {
          ...asset,
          metrics: {
            totalInvested: asset.quantity * asset.purchasePrice,
            currentValue: asset.quantity * asset.purchasePrice,
            gainLoss: 0,
            gainLossPercentage: 0,
            currentPrice: asset.purchasePrice,
            priceChange24h: 0
          }
        };
      }
    }));

    // Calculate portfolio summary
    const totalValue = assetsWithMetrics.reduce((sum, asset) => sum + asset.metrics.currentValue, 0);
    const totalInvested = assetsWithMetrics.reduce((sum, asset) => sum + asset.metrics.totalInvested, 0);
    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    // Calculate asset allocation
    const allocation = assetsWithMetrics.map(asset => ({
      symbol: asset.symbol,
      type: asset.type,
      percentage: totalValue > 0 ? (asset.metrics.currentValue / totalValue) * 100 : 0
    }));

    return NextResponse.json({
      assets: assetsWithMetrics,
      summary: {
        totalValue,
        totalGainLoss,
        totalAssets: assetsWithMetrics.length,
        totalGainLossPercentage
      },
      allocation
    });

  } catch (error) {
    console.error('GET /api/portfolio/assets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
} 