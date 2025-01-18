import { prisma } from './prisma';
import { marketData } from './market-data';

export interface Asset {
  id: string;
  symbol: string;
  name?: string;
  quantity: number;
  currentPrice: number;
  purchasePrice: number;
  type: string;
  notes?: string;
  purchaseDate: Date;
}

// Raw market data from the API
export interface RawMarketData {
  [key: string]: any;
}

// Our standardized market quote format
export interface MarketQuote {
  currentPrice: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
}

export interface ChartDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PortfolioData {
  assets: Asset[];
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  chartData?: ChartDataPoint[];
}

// Helper function to normalize market data from different sources
function normalizeMarketData(data: RawMarketData): MarketQuote {
  // Handle Finnhub format
  if ('c' in data) {
    return {
      currentPrice: data.c,
      open: data.o,
      high: data.h,
      low: data.l,
      previousClose: data.pc,
      change: data.d,
      changePercent: data.dp,
      volume: data.v,
    };
  }
  
  // Handle Alpha Vantage format
  if ('Global Quote' in data) {
    const quote = data['Global Quote'];
    return {
      currentPrice: parseFloat(quote['05. price']),
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      previousClose: parseFloat(quote['08. previous close']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
    };
  }

  // Fallback with default values
  return {
    currentPrice: 0,
    open: 0,
    high: 0,
    low: 0,
    previousClose: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
  };
}

export async function getPortfolioData(userId: string): Promise<PortfolioData> {
  const portfolio = await prisma.portfolio.findUnique({
    where: { userId },
    include: { assets: true },
  });

  if (!portfolio) {
    throw new Error('Portfolio not found');
  }

  // Get current prices for all assets
  const assetsWithPrices = await Promise.all(
    portfolio.assets.map(async (prismaAsset) => {
      try {
        const rawQuote = await marketData.getQuote(prismaAsset.symbol);
        const quote = normalizeMarketData(rawQuote);
        const asset: Asset = {
          id: prismaAsset.id,
          symbol: prismaAsset.symbol,
          quantity: prismaAsset.quantity,
          currentPrice: quote.currentPrice || prismaAsset.purchasePrice,
          purchasePrice: prismaAsset.purchasePrice,
          type: prismaAsset.type,
          notes: prismaAsset.notes || undefined,
          purchaseDate: prismaAsset.purchaseDate
        };
        return asset;
      } catch (error) {
        console.error(`Error fetching quote for ${prismaAsset.symbol}:`, error);
        const asset: Asset = {
          id: prismaAsset.id,
          symbol: prismaAsset.symbol,
          quantity: prismaAsset.quantity,
          currentPrice: prismaAsset.purchasePrice,
          purchasePrice: prismaAsset.purchasePrice,
          type: prismaAsset.type,
          notes: prismaAsset.notes || undefined,
          purchaseDate: prismaAsset.purchaseDate
        };
        return asset;
      }
    })
  );

  const totalValue = assetsWithPrices.reduce(
    (sum, asset) => sum + asset.quantity * asset.currentPrice,
    0
  );

  const totalCost = assetsWithPrices.reduce(
    (sum, asset) => sum + asset.quantity * asset.purchasePrice,
    0
  );

  const totalGain = totalValue - totalCost;
  const totalGainPercent = (totalGain / totalCost) * 100;

  // Get historical data for portfolio chart
  const mainAsset = assetsWithPrices[0];
  const chartData = mainAsset 
    ? await marketData.getHistoricalData(mainAsset.symbol, '1D', 'compact')
    : undefined;

  return {
    assets: assetsWithPrices,
    totalValue,
    totalGain,
    totalGainPercent,
    chartData,
  };
}
