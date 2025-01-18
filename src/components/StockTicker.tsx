import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  bid: number | null;
  ask: number | null;
}

export default function StockTicker() {
  const { data: stocks, isLoading, error } = useQuery<StockData[]>({
    queryKey: ['stocks'],
    queryFn: async () => {
      const response = await fetch('/api/stocks/ticker');
      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  if (isLoading || !stocks || stocks.length === 0) {
    return null;
  }

  if (error) {
    console.error('Error fetching stock data:', error);
    return null;
  }

  return (
    <div className="w-full bg-background border-y">
      <div className="relative overflow-x-hidden">
        <div className="flex animate-scroll">
          {/* First ticker strip */}
          <div className="flex items-center space-x-8 py-3 whitespace-nowrap">
            {stocks.map((stock) => (
              <div key={stock.symbol} className="flex items-center space-x-2">
                <span className="font-semibold">{stock.symbol}</span>
                <span className="text-sm">${stock.price.toFixed(2)}</span>
                <div className="flex items-center">
                  {stock.change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={`text-sm ml-1 ${
                      stock.change >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {stock.changePercent.toFixed(2)}%
                  </span>
                </div>
                {stock.bid && stock.ask && (
                  <span className="text-sm text-muted-foreground">
                    B: ${stock.bid.toFixed(2)} A: ${stock.ask.toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>
          {/* Duplicate ticker strip for seamless loop */}
          <div className="flex items-center space-x-8 py-3 whitespace-nowrap">
            {stocks.map((stock) => (
              <div key={`${stock.symbol}-dup`} className="flex items-center space-x-2">
                <span className="font-semibold">{stock.symbol}</span>
                <span className="text-sm">${stock.price.toFixed(2)}</span>
                <div className="flex items-center">
                  {stock.change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={`text-sm ml-1 ${
                      stock.change >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {stock.changePercent.toFixed(2)}%
                  </span>
                </div>
                {stock.bid && stock.ask && (
                  <span className="text-sm text-muted-foreground">
                    B: ${stock.bid.toFixed(2)} A: ${stock.ask.toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 