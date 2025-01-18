import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { updateAssetPrices } from '@/lib/price-service';
import { Prisma } from '.prisma/client';

type AssetType = 'crypto' | 'stock';
type TransactionType = 'BUY' | 'SELL';

interface PrismaAsset {
  id: string;
  symbol: string;
  type: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: Date;
  notes: string | null;
  portfolioId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaTransaction {
  id: string;
  type: string;
  quantity: number;
  price: number;
  date: Date;
  assetId: string;
  portfolioId: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Asset extends Omit<PrismaAsset, 'type'> {
  type: AssetType;
}

interface Transaction extends Omit<PrismaTransaction, 'type'> {
  type: TransactionType;
}

interface AssetWithTransactions extends Asset {
  transactions: Transaction[];
}

interface AssetMetrics {
  totalInvested: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  currentPrice: number;
  priceChange24h?: number;
}

interface AssetWithMetrics extends Asset {
  transactions: Transaction[];
  metrics: AssetMetrics;
}

interface AssetAllocation {
  symbol: string;
  type: string;
  value: number;
  percentage: number;
}

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
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = assetSchema.parse(body);

    // Ensure user has a portfolio
    const portfolio = await prisma.portfolio.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    // Create the asset and transaction record
    const asset = await prisma.asset.create({
      data: {
        portfolioId: portfolio.id,
        symbol: validatedData.symbol,
        type: validatedData.type,
        quantity: validatedData.quantity,
        purchasePrice: validatedData.purchasePrice,
        purchaseDate: new Date(validatedData.purchaseDate),
        notes: validatedData.notes,
        transactions: {
          create: {
            type: 'BUY',
            quantity: validatedData.quantity,
            price: validatedData.purchasePrice,
            date: new Date(validatedData.purchaseDate),
            portfolio: {
              connect: {
                id: portfolio.id
              }
            }
          } satisfies Prisma.TransactionCreateWithoutAssetInput,
        },
      },
      include: {
        transactions: true,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Asset creation error:', error);
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

export async function GET() {
  try {
    const { userId } = auth();
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
        },
      },
    });

    if (!portfolio) {
      return NextResponse.json({ assets: [] });
    }

    // Fetch real-time prices for all assets
    const priceUpdates = await updateAssetPrices(
      portfolio.assets.map((asset: PrismaAsset) => ({
        symbol: asset.symbol,
        type: asset.type as AssetType,
      }))
    );

    // Create a map of current prices
    const currentPrices = new Map(
      priceUpdates.map(update => [update.symbol, update])
    );

    // Calculate additional metrics for each asset
    const assetsWithMetrics = portfolio.assets.map((prismaAsset: PrismaAsset & { transactions: PrismaTransaction[] }) => {
      const asset = {
        ...prismaAsset,
        type: prismaAsset.type as AssetType,
        transactions: prismaAsset.transactions.map(t => ({ ...t, type: t.type as TransactionType })),
      };

      const totalInvested = asset.quantity * asset.purchasePrice;
      const priceData = currentPrices.get(asset.symbol);
      const currentPrice = priceData?.price ?? asset.purchasePrice;
      const currentValue = asset.quantity * currentPrice;
      const gainLoss = currentValue - totalInvested;
      const gainLossPercentage = ((currentValue - totalInvested) / totalInvested) * 100;

      return {
        ...asset,
        metrics: {
          totalInvested,
          currentValue,
          gainLoss,
          gainLossPercentage,
          currentPrice,
          priceChange24h: priceData?.priceChange24h,
        },
      } as AssetWithMetrics;
    });

    // Calculate portfolio summary
    console.log('Assets with metrics:', JSON.stringify(assetsWithMetrics, null, 2));
    const totalValue = assetsWithMetrics.reduce((sum, asset) => sum + asset.metrics.currentValue, 0);
    const totalInvested = assetsWithMetrics.reduce((sum, asset) => sum + asset.metrics.totalInvested, 0);
    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercentage = ((totalValue - totalInvested) / totalInvested) * 100;

    console.log('Portfolio summary:', {
      totalValue,
      totalInvested,
      totalGainLoss,
      totalGainLossPercentage
    });

    // Calculate asset allocation
    const allocation = assetsWithMetrics.map((asset): AssetAllocation => ({
      symbol: asset.symbol,
      type: asset.type,
      value: asset.metrics.currentValue,
      percentage: (asset.metrics.currentValue / totalValue) * 100,
    }));

    return NextResponse.json({
      assets: assetsWithMetrics,
      summary: {
        totalAssets: assetsWithMetrics.length,
        totalValue,
        totalInvested,
        totalGainLoss,
        totalGainLossPercentage,
      },
      allocation,
    });
  } catch (error) {
    console.error('Asset fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
} 