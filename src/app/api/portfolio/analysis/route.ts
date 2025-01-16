import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { marketData } from '@/lib/market-data';
import type { Asset, PortfolioAnalysis } from '../types';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: { assets: true },
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const analysis = await calculatePortfolioAnalysis(portfolio.assets);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in portfolio analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function calculatePortfolioAnalysis(assets: Asset[]): Promise<PortfolioAnalysis> {
  const totalValue = assets.reduce((sum, asset) => sum + asset.quantity * asset.currentPrice, 0);
  const totalCost = assets.reduce((sum, asset) => sum + asset.quantity * asset.costBasis, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = (totalGain / totalCost) * 100;

  // Calculate risk metrics
  const returns = await Promise.all(
    assets.map(async (asset: Asset) => {
      const historicalData = await marketData.getHistoricalData(asset.symbol, '1D', 'compact');
      return historicalData.map(d => (d.close - d.open) / d.open);
    })
  );

  const portfolioReturns = returns[0].map((_, i) => 
    returns.reduce((sum, assetReturns, j) => 
      sum + assetReturns[i] * (assets[j].quantity * assets[j].currentPrice / totalValue),
      0
    )
  );

  const volatility = calculateVolatility(portfolioReturns);
  const sharpeRatio = calculateSharpeRatio(portfolioReturns);

  // Calculate asset allocation
  const assetAllocation = assets.map(asset => ({
    symbol: asset.symbol,
    name: asset.name,
    value: asset.quantity * asset.currentPrice,
    percentage: (asset.quantity * asset.currentPrice / totalValue) * 100,
  }));

  return {
    totalValue,
    totalGain,
    totalGainPercent,
    metrics: {
      volatility,
      sharpeRatio,
      beta: 0, // Requires benchmark data
      alpha: 0, // Requires benchmark data
    },
    assetAllocation,
    performanceMetrics: {
      dailyReturn: portfolioReturns[portfolioReturns.length - 1] * 100,
      weeklyReturn: portfolioReturns.slice(-5).reduce((a, b) => a + b, 0) * 100,
      monthlyReturn: portfolioReturns.slice(-20).reduce((a, b) => a + b, 0) * 100,
      yearlyReturn: portfolioReturns.reduce((a, b) => a + b, 0) * 100,
    },
  };
}

function calculateVolatility(returns: number[]): number {
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  return Math.sqrt(variance * 252); // Annualized volatility
}

function calculateSharpeRatio(returns: number[]): number {
  const riskFreeRate = 0.02; // 2% annual risk-free rate
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const volatility = calculateVolatility(returns);
  return (mean * 252 - riskFreeRate) / volatility; // Annualized Sharpe ratio
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const analysis = await calculatePortfolioAnalysis(data.assets);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in portfolio analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
