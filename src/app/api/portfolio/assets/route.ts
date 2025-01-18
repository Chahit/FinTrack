import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { updateAssetPrices } from '@/lib/price-service';

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

export async function GET(req: NextRequest) {
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
    const assetsWithMetrics = await Promise.all(
      portfolio.assets.map(async (prismaAsset: PrismaAsset & { transactions: PrismaTransaction[] }) => {
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
      })
    );

    // Calculate portfolio summary
    const totalValue = assetsWithMetrics.reduce((sum, asset) => sum + asset.metrics.currentValue, 0);
    const totalInvested = assetsWithMetrics.reduce((sum, asset) => sum + asset.metrics.totalInvested, 0);
    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercentage = ((totalValue - totalInvested) / totalInvested) * 100;

    // Calculate asset allocation
    const allocation = assetsWithMetrics.map((asset): AssetAllocation => ({
      symbol: asset.symbol,
      type: asset.type,
      value: asset.metrics.currentValue,
      percentage: (asset.metrics.currentValue / totalValue) * 100,
    }));

    const response = {
      assets: assetsWithMetrics,
      summary: {
        totalAssets: assetsWithMetrics.length,
        totalValue,
        totalInvested,
        totalGainLoss,
        totalGainLossPercentage,
      },
      allocation,
    };

    console.log('API Response:', JSON.stringify(response, null, 2));
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch portfolio assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio assets' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { symbol, type, quantity, purchasePrice, purchaseDate, notes } = data;

    // Get or create portfolio for the user
    let portfolio = await prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: { userId },
      });
    }

    // Create the asset
    const asset = await prisma.asset.create({
      data: {
        symbol: symbol.toUpperCase(),
        type,
        quantity,
        purchasePrice,
        purchaseDate: new Date(purchaseDate),
        notes: notes || null,
        portfolioId: portfolio.id,
      },
    });

    // Create initial BUY transaction
    await prisma.transaction.create({
      data: {
        type: 'BUY',
        quantity,
        price: purchasePrice,
        date: new Date(purchaseDate),
        notes: notes || null,
        assetId: asset.id,
        portfolioId: portfolio.id,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Failed to add asset:', error);
    return NextResponse.json(
      { error: 'Failed to add asset' },
      { status: 500 }
    );
  }
} 