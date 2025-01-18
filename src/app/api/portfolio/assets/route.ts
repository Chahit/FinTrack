import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getCurrentPrice } from '@/lib/price-service';
import { Prisma } from '.prisma/client';

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

type Transaction = {
  id: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  date: Date;
  assetId: string;
  portfolioId: string;
  createdAt: Date;
  updatedAt: Date;
};

// Schema for asset validation
const assetSchema = z.object({
  symbol: z.string().min(1),
  type: z.enum(['crypto', 'stock']),
  quantity: z.union([
    z.number().positive(),
    z.string().transform((val) => Number(val))
  ]).refine((val) => !isNaN(val) && val > 0, {
    message: 'Quantity must be a positive number'
  }),
  purchasePrice: z.union([
    z.number().positive(),
    z.string().transform((val) => Number(val))
  ]).refine((val) => !isNaN(val) && val > 0, {
    message: 'Purchase price must be a positive number'
  }),
  purchaseDate: z.string().transform((val) => {
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return date.toISOString();
  }),
  notes: z.string().optional().transform(val => val || ''),
});

interface AssetWithTransactions extends Asset {
  transactions: Transaction[];
}

interface AssetMetrics {
  totalInvested: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  currentPrice: number;
  priceChange24h: number;
  error?: string;
}

interface AssetWithMetrics extends Asset {
  transactions: Transaction[];
  metrics: AssetMetrics;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = assetSchema.parse(body);

    // First, ensure the user exists
    const user = await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email: '',
      },
      update: {},
    });

    // Then get or create portfolio for user
    const portfolio = await prisma.portfolio.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    // Create new asset with a transaction in a single transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const asset = await tx.asset.create({
        data: {
          portfolioId: portfolio.id,
          symbol: validatedData.symbol.toUpperCase(),
          type: validatedData.type,
          quantity: validatedData.quantity,
          purchasePrice: validatedData.purchasePrice,
          purchaseDate: new Date(validatedData.purchaseDate),
          notes: validatedData.notes,
        },
      });

      await tx.transaction.create({
        data: {
          portfolioId: portfolio.id,
          assetId: asset.id,
          type: 'BUY',
          quantity: validatedData.quantity,
          price: validatedData.purchasePrice,
          date: new Date(validatedData.purchaseDate),
        },
      });

      return asset;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/portfolio/assets error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create asset', details: error instanceof Error ? error.message : 'Unknown error' },
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
    const assetsWithMetrics: AssetWithMetrics[] = await Promise.all(
      portfolio.assets.map(async (asset: AssetWithTransactions) => {
        try {
          const priceResult = await getCurrentPrice(asset.symbol, asset.type as 'crypto' | 'stock');
          if (!priceResult) {
            throw new Error(`No price data available for ${asset.symbol}`);
          }
          
          const currentPrice = priceResult;
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
          // Return asset with more detailed error handling
          return {
            ...asset,
            metrics: {
              totalInvested: asset.quantity * asset.purchasePrice,
              currentValue: asset.quantity * asset.purchasePrice,
              gainLoss: 0,
              gainLossPercentage: 0,
              currentPrice: asset.purchasePrice,
              priceChange24h: 0
            },
            error: error instanceof Error ? error.message : 'Failed to fetch current price'
          };
        }
      })
    );

    // Calculate portfolio summary
    const totalValue = assetsWithMetrics.reduce((sum: number, asset: AssetWithMetrics) => sum + asset.metrics.currentValue, 0);
    const totalInvested = assetsWithMetrics.reduce((sum: number, asset: AssetWithMetrics) => sum + asset.metrics.totalInvested, 0);
    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    // Calculate asset allocation
    const allocation = assetsWithMetrics.map((asset: AssetWithMetrics) => ({
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