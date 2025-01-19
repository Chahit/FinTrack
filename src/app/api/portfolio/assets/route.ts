import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { updateAssetPrices } from '@/lib/price-service';
import { Asset, Portfolio, Prisma } from '@prisma/client';

interface AssetWithTransactions extends Asset {
  transactions: Array<{
    id: string;
    quantity: number;
    price: number;
    type: string;
    date: Date;
  }>;
}

interface PortfolioWithAssets extends Portfolio {
  assets: AssetWithTransactions[];
}

interface AssetMetrics {
  totalInvested: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  currentPrice: number;
  priceChange24h?: number;
}

interface AssetWithMetrics extends AssetWithTransactions {
  metrics: AssetMetrics;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
if (!session?.user) {
  return new NextResponse('Unauthorized', { status: 401 });
}
const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First check if user exists, if not create them
    const userQuery = {
      where: { id: userId },
      include: { portfolio: true }
    } satisfies Prisma.UserFindUniqueArgs;
    
    const user = await prisma.user.findUnique(userQuery);

    if (!user) {
      // Create user and portfolio
      await prisma.user.create({
        data: {
          id: userId,
          email: 'user@example.com',
          portfolio: {
            create: {}
          }
        }
      });
    }

    // Now get or create portfolio
    const portfolioQuery = {
      where: { userId },
      include: {
        assets: {
          include: {
            transactions: true,
          },
        },
      },
    } satisfies Prisma.PortfolioFindUniqueArgs;

    let portfolio = await prisma.portfolio.findUnique(portfolioQuery) as PortfolioWithAssets | null;

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: { userId },
        include: {
          assets: {
            include: {
              transactions: true,
            },
          },
        },
      }) as PortfolioWithAssets;
    }

    const priceUpdates = await updateAssetPrices(
      portfolio.assets.map((asset) => ({
        symbol: asset.symbol,
        type: asset.type as 'crypto' | 'stock',
      }))
    );

    const currentPrices = new Map(
      priceUpdates.map(update => [update.symbol, update])
    );

    const assetsWithMetrics: AssetWithMetrics[] = await Promise.all(
      portfolio.assets.map(async (asset: AssetWithTransactions) => {
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
        };
      })
    );

    const totalValue = assetsWithMetrics.reduce((sum: number, asset: AssetWithMetrics) => sum + asset.metrics.currentValue, 0);
    const totalInvested = assetsWithMetrics.reduce((sum: number, asset: AssetWithMetrics) => sum + asset.metrics.totalInvested, 0);
    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    const allocation = assetsWithMetrics.map((asset: AssetWithMetrics) => ({
      symbol: asset.symbol,
      type: asset.type,
      value: asset.metrics.currentValue,
      percentage: totalValue > 0 ? (asset.metrics.currentValue / totalValue) * 100 : 0,
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
    console.error('Failed to fetch portfolio assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio assets' },
      { status: 500 }
    );
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