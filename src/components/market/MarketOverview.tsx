'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchMarketData } from '@/lib/api';

interface MarketData {
  bitcoin: {
    price: number;
    change: number;
  };
  sp500: {
    price: number;
    change: number;
  };
  gold: {
    price: number;
    change: number;
  };
  fearAndGreed: {
    value: number;
    status: string;
  };
}

export function MarketOverview() {
  const [data, setData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const marketData = await fetchMarketData();
        setData(marketData);
      } catch (err) {
        setError('Failed to fetch market data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p>Loading market data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">S&P 500</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.sp500.price.toLocaleString()}</div>
          <p className={`text-xs ${data?.sp500.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {data?.sp500.change >= 0 ? '+' : ''}{data?.sp500.change.toFixed(2)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Bitcoin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data?.bitcoin.price.toLocaleString()}</div>
          <p className={`text-xs ${data?.bitcoin.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {data?.bitcoin.change >= 0 ? '+' : ''}{data?.bitcoin.change.toFixed(2)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Gold</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data?.gold.price.toLocaleString()}</div>
          <p className={`text-xs ${data?.gold.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {data?.gold.change >= 0 ? '+' : ''}{data?.gold.change.toFixed(2)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Market Fear & Greed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.fearAndGreed.value}</div>
          <p className="text-xs text-muted-foreground">{data?.fearAndGreed.status}</p>
        </CardContent>
      </Card>
    </div>
  );
}
