'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPortfolioData } from '@/lib/api';

interface PortfolioData {
  totalValue: number;
  previousValue: number;
  dailyChange: {
    percentage: number;
    value: number;
  };
  assets: {
    count: number;
    bestPerformer: {
      symbol: string;
      change: number;
    };
  };
}

export function PortfolioOverview() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you'd get the userId from your auth system
        const userId = 'current-user';
        const portfolioData = await fetchPortfolioData(userId);
        setData(portfolioData);
      } catch (err) {
        setError('Failed to fetch portfolio data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Refresh data every minute
    const interval = setInterval(fetchData, 60 * 1000);
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
            <p>Loading portfolio data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${data?.totalValue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            ${((data?.totalValue || 0) - (data?.previousValue || 0)).toLocaleString()} ({((((data?.totalValue || 0) - (data?.previousValue || 0)) / (data?.previousValue || 1)) * 100).toFixed(2)}%)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Daily Change</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${data?.dailyChange.percentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {data?.dailyChange.percentage >= 0 ? '+' : ''}{data?.dailyChange.percentage.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground">
            ${data?.dailyChange.value.toLocaleString()} today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.assets.count}</div>
          <p className="text-xs text-muted-foreground">Active positions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.assets.bestPerformer.symbol}</div>
          <p className={`text-xs ${data?.assets.bestPerformer.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {data?.assets.bestPerformer.change >= 0 ? '+' : ''}{data?.assets.bestPerformer.change.toFixed(2)}% today
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
