import React from 'react';
import { useQuery } from '@tanstack/react-query';

export function StockTicker() {
  const { data: stocks } = useQuery({
    queryKey: ['stocks'],
    queryFn: async () => {
      const response = await fetch('/api/stocks/ticker');
      if (!response.ok) {
        throw new Error('Failed to fetch stocks');
      }
      return response.json();
    },
  });

  if (!stocks?.length) return null;

  return (
    <div className="w-full bg-background border-b overflow-hidden">
      <div className="animate-scroll flex items-center whitespace-nowrap">
        {[...stocks, ...stocks].map((stock: any, index) => (
          <div key={`${stock.symbol}-${index}`} className="flex items-center space-x-2 mx-4">
            <span className="font-medium">{stock.symbol}</span>
            <span className={stock.change >= 0 ? 'text-green-500' : 'text-red-500'}>
              ${stock.price.toFixed(2)} ({stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 