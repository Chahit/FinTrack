import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

interface Asset {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercentage: number;
}

interface Portfolio {
  id: string;
  userId: string;
  totalValue: number;
  dailyChange: number;
  dailyChangePercentage: number;
  assets: Asset[];
  riskScore: number;
  lastUpdated: Date;
}

async function fetchPortfolio(userId: string): Promise<Portfolio> {
  const response = await fetch(`/api/portfolio/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch portfolio');
  }
  return response.json();
}

export function usePortfolio() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['portfolio', session?.user?.id],
    queryFn: () => fetchPortfolio(session?.user?.id || ''),
    enabled: !!session?.user?.id,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}
