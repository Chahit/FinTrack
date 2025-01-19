import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';
import { updateAssetPrices } from '@/lib/price-service';

// Use Node.js runtime for Prisma compatibility
export const runtime = 'nodejs';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

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

interface Asset extends Omit<PrismaAsset, 'type'> {
  type: AssetType;
}

interface PortfolioAsset {
  id: string;
  symbol: string;
  type: AssetType;
  amount: number;
  currentPrice: number;
  priceChange24h: number;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const user = session.user;
    
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: user.id },
      include: {
        assets: true,
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

    // Transform assets with current prices
    const portfolioAssets = await Promise.all(
      portfolio.assets.map(async (prismaAsset: PrismaAsset) => {
        const asset = {
          ...prismaAsset,
          type: prismaAsset.type as AssetType,
        };

        const priceData = currentPrices.get(asset.symbol);
        const currentPrice = priceData?.price ?? asset.purchasePrice;

        return {
          id: asset.id,
          symbol: asset.symbol,
          type: asset.type,
          amount: asset.quantity,
          currentPrice,
          priceChange24h: priceData?.priceChange24h ?? 0,
        } as PortfolioAsset;
      })
    );

    return NextResponse.json({ assets: portfolioAssets });
  } catch (error) {
    console.error('Failed to fetch portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}