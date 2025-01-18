'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Image from 'next/image';

interface MarketData {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  percentChange: number | null;
}

const CRYPTO_SYMBOLS = [
  { 
    symbol: 'BTC', 
    name: 'Bitcoin',
    icon: '/crypto-icons/bitcoin.png'
  },
  { 
    symbol: 'ETH', 
    name: 'Ethereum',
    icon: '/crypto-icons/ethereum.png'
  },
  { 
    symbol: 'BNB', 
    name: 'BNB',
    icon: '/crypto-icons/bnb.png'
  },
  { 
    symbol: 'SOL', 
    name: 'Solana',
    icon: '/crypto-icons/solana.png'
  },
  { 
    symbol: 'AVAX', 
    name: 'Avalanche',
    icon: '/crypto-icons/avalanche.png'
  },
  { 
    symbol: 'ADA', 
    name: 'Cardano',
    icon: '/crypto-icons/cardano.png'
  },
];

const formatNumber = (value: number | null): string => {
  if (value === null || isNaN(value)) return '---';
  return value.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: value >= 100 ? 2 : 4 
  });
};

export function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = async (retryCount = 0) => {
    try {
      const promises = CRYPTO_SYMBOLS.map(async ({ symbol, name }) => {
        try {
          const response = await fetch(`/api/market/${symbol}`);
          const data = await response.json();
          
          if (!response.ok || data.error) {
            console.error(`Error fetching ${symbol}:`, data.error);
            return {
              symbol,
              name,
              price: null,
              change: null,
              percentChange: null,
            };
          }

          return {
            symbol,
            name,
            price: data.c,
            change: data.d,
            percentChange: data.dp,
          };
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          return {
            symbol,
            name,
            price: null,
            change: null,
            percentChange: null,
          };
        }
      });

      const results = await Promise.all(promises);
      
      // Check if we have at least one valid result
      const hasValidData = results.some(result => result.price !== null);
      
      if (!hasValidData && retryCount < 3) {
        // Wait for 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchMarketData(retryCount + 1);
      }

      setMarketData(results);
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      setError('Failed to fetch cryptocurrency data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchMarketData();
            }}
            className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {marketData.map((item, index) => {
        const cryptoInfo = CRYPTO_SYMBOLS.find(c => c.symbol === item.symbol);
        return (
          <Card key={item.symbol} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {cryptoInfo?.icon && (
                    <div className="w-6 h-6 relative">
                      <Image
                        src={cryptoInfo.icon}
                        alt={item.name}
                        fill
                        sizes="24px"
                        className="rounded-full object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">{item.name}</h3>
                    <span className="text-xs text-muted-foreground">{item.symbol}</span>
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {item.price === null ? '---' : `$${formatNumber(item.price)}`}
                </p>
              </div>
              <div className="flex flex-col items-end">
                {item.change !== null && item.percentChange !== null && (
                  <>
                    <div className={`flex items-center ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.change >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-sm font-medium">
                        {item.change >= 0 ? '+' : ''}
                        {formatNumber(item.change)}
                      </span>
                    </div>
                    <span className={`text-sm ${item.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.percentChange >= 0 ? '+' : ''}
                      {formatNumber(item.percentChange)}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
} 