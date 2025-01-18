export interface Asset {
  id: string;
  symbol: string;
  type: 'crypto' | 'stock';
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  date: Date;
  notes?: string;
} 