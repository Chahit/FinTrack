'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { AssetList } from './components/AssetList';
import { TransactionHistory } from '@/components/TransactionHistory';
import { PriceAlerts } from '@/components/PriceAlerts';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { FlatCard, FlatCardHeader, FlatCardContent } from '@/components/ui/flat-card';
import { InteractiveChart } from '@/components/ui/interactive-chart';
import { AssetForm } from '@/components/AssetForm';

async function fetchPortfolioData() {
  const response = await fetch('/api/portfolio/assets');
  if (!response.ok) {
    throw new Error('Failed to fetch portfolio data');
  }
  return response.json();
}

export default function PortfolioPage() {
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const { data: portfolio, isLoading, error, refetch } = useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolioData,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 10000,
  });

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <SkeletonCard className="w-[200px] h-[40px]" />
            <div className="flex gap-4">
              <SkeletonCard className="w-[100px] h-[40px]" />
              <SkeletonCard className="w-[100px] h-[40px]" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} className="h-[120px]" />
            ))}
          </div>
          <SkeletonCard className="h-[300px]" />
          <SkeletonCard className="h-[400px]" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <FlatCard>
          <FlatCardContent>
            <div className="text-center text-red-500">
              Error loading portfolio data. Please try again later.
            </div>
          </FlatCardContent>
        </FlatCard>
      </PageContainer>
    );
  }

  const { assets = [], summary = {} } = portfolio || {};

  // Prepare chart data
  const chartData = assets.map((asset: any) => ({
    name: asset.symbol,
    value: asset.metrics.currentValue,
  }));

  return (
    <PageContainer>
      <div className="relative">
        <div className="relative z-10 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <FlatCard>
              <FlatCardHeader>
                <h1 className="text-4xl font-bold tracking-tight">Portfolio</h1>
              </FlatCardHeader>
            </FlatCard>
            <div className="flex gap-4">
              <Button size="sm" onClick={() => setIsAddAssetOpen(true)} className="light:border-black">
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </div>
          </div>

          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <FlatCard>
              <FlatCardContent>
                <h3 className="text-sm font-medium text-muted-foreground">Total Value</h3>
                <p className="text-3xl font-bold mt-2">
                  ${summary.totalValue?.toLocaleString() || '0'}
                </p>
              </FlatCardContent>
            </FlatCard>

            <FlatCard>
              <FlatCardContent>
                <h3 className="text-sm font-medium text-muted-foreground">24h Change</h3>
                <p className={`text-3xl font-bold mt-2 ${
                  (summary.dayChange || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {summary.dayChange >= 0 ? '+' : ''}{summary.dayChange?.toFixed(2)}%
                </p>
              </FlatCardContent>
            </FlatCard>

            <FlatCard>
              <FlatCardContent>
                <h3 className="text-sm font-medium text-muted-foreground">Total Profit/Loss</h3>
                <p className={`text-3xl font-bold mt-2 ${
                  (summary.totalGainLoss || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  ${summary.totalGainLoss?.toLocaleString() || '0'}
                </p>
              </FlatCardContent>
            </FlatCard>

            <FlatCard>
              <FlatCardContent>
                <h3 className="text-sm font-medium text-muted-foreground">Number of Assets</h3>
                <p className="text-3xl font-bold mt-2">{assets.length}</p>
              </FlatCardContent>
            </FlatCard>
          </div>

          {/* Portfolio Chart */}
          <FlatCard>
            <FlatCardContent>
              <div className="h-[300px]">
                <InteractiveChart
                  data={chartData}
                  height={300}
                  tooltipFormatter={(value) => `$${value.toLocaleString()}`}
                />
              </div>
            </FlatCardContent>
          </FlatCard>

          {/* Main Content */}
          <Tabs defaultValue="assets" className="space-y-6">
            <FlatCard>
              <FlatCardContent>
                <TabsList className="w-full justify-start border-b light:border-black">
                  <TabsTrigger value="assets">Assets</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
                </TabsList>
              </FlatCardContent>
            </FlatCard>

            <TabsContent value="assets">
              <FlatCard>
                <FlatCardContent>
                  <AssetList assets={assets} refetch={refetch} />
                </FlatCardContent>
              </FlatCard>
            </TabsContent>

            <TabsContent value="transactions">
              <FlatCard>
                <FlatCardContent>
                  <TransactionHistory assets={assets} />
                </FlatCardContent>
              </FlatCard>
            </TabsContent>

            <TabsContent value="alerts">
              <FlatCard>
                <FlatCardContent>
                  <PriceAlerts assets={assets} />
                </FlatCardContent>
              </FlatCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <AssetForm
        isOpen={isAddAssetOpen}
        onClose={() => setIsAddAssetOpen(false)}
        onSubmit={async (data) => {
          try {
            const response = await fetch('/api/portfolio/assets', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to add asset');
            }

            await refetch();
            setIsAddAssetOpen(false);
          } catch (error) {
            console.error('Error adding asset:', error);
            throw error; // This will be caught by the form's error handling
          }
        }}
        mode="add"
        refetch={refetch}
      />
    </PageContainer>
  );
}
