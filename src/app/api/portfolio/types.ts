// types.ts
import { Document } from 'mongodb';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  currentPrice: number;
  costBasis: number;
  type: string;
}

export interface Portfolio extends Document {
  userId: string;
  assets: Asset[];
}

export interface PortfolioAnalysis {
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  metrics: {
    volatility: number;
    sharpeRatio: number;
    beta: number;
    alpha: number;
  };
  assetAllocation: {
    symbol: string;
    name: string;
    value: number;
    percentage: number;
  }[];
  performanceMetrics: {
    dailyReturn: number;
    weeklyReturn: number;
    monthlyReturn: number;
    yearlyReturn: number;
  };
}

export interface UpdatePortfolioRequest {
  assets: Asset[];
}

export interface DeleteAssetRequest {
  symbol: string;
}