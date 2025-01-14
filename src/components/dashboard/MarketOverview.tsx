"use client";

import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: string;
}

export function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated market data - replace with real API
    const mockData = [
      { symbol: 'BTC/USD', price: 45000, change: 2.5, volume: '24.5B' },
      { symbol: 'ETH/USD', price: 2800, change: -1.2, volume: '12.8B' },
      { symbol: 'S&P 500', price: 4700, change: 0.8, volume: '5.2B' },
      { symbol: 'NASDAQ', price: 15800, change: 1.5, volume: '8.9B' },
    ];

    setMarketData(mockData);
    setLoading(false);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setMarketData(current =>
        current.map(item => ({
          ...item,
          price: item.price * (1 + (Math.random() - 0.5) * 0.002),
          change: item.change + (Math.random() - 0.5) * 0.1
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="glass p-6 rounded-xl animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Market Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketData.map((item, index) => (
          <motion.div
            key={item.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-background/50 p-4 rounded-lg"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-gray-400">{item.symbol}</span>
              <span className={`flex items-center text-sm ${
                item.change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {item.change >= 0 ? (
                  <ArrowUp className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(item.change).toFixed(2)}%
              </span>
            </div>
            <div className="text-2xl font-bold mb-2">
              ${item.price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            <div className="text-sm text-gray-400">
              Vol: {item.volume}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
