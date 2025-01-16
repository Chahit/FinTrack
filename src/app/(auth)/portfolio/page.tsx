'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/ui/page-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssetList } from './components/AssetList';
import { TransactionHistory } from './components/TransactionHistory';
import { PriceAlerts } from './components/PriceAlerts';
import { AssetForm } from './components/AssetForm';
import { Plus, Upload, Download } from 'lucide-react';
import { InteractiveChart } from '@/components/ui/interactive-chart';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { SparklesCore } from '@/components/ui/sparkles';
import { SkeletonCard, SkeletonChartCard, SkeletonTable } from '@/components/ui/skeleton-card';

// Fetch portfolio data
async function fetchPortfolioData() {
  const response = await fetch('/api/portfolio/assets');
  if (!response.ok) {
    throw new Error('Failed to fetch portfolio data');
  }
  return response.json();
}

export default function PortfolioPage() {
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const { data: portfolio, isLoading, error } = useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolioData,
  });

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <SkeletonCard className="w-[200px]" />
            <div className="flex gap-2">
              <SkeletonCard className="w-[100px]" />
              <SkeletonCard className="w-[100px]" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <SkeletonChartCard />
          <SkeletonTable rows={5} />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="text-center text-red-500">
          Error loading portfolio data. Please try again later.
        </div>
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setIsAddAssetOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <CardContainer>
          <CardBody>
            <CardItem>
              <h3 className="text-sm font-medium text-muted-foreground">Total Value</h3>
              <p className="text-2xl font-bold mt-2">
                ${summary.totalValue?.toLocaleString() || '0'}
              </p>
            </CardItem>
          </CardBody>
        </CardContainer>

        <CardContainer>
          <CardBody>
            <CardItem>
              <h3 className="text-sm font-medium text-muted-foreground">24h Change</h3>
              <p className={`text-2xl font-bold mt-2 ${
                (summary.dayChange || 0) >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {summary.dayChange >= 0 ? '+' : ''}{summary.dayChange?.toFixed(2)}%
              </p>
            </CardItem>
          </CardBody>
        </CardContainer>

        <CardContainer>
          <CardBody>
            <CardItem>
              <h3 className="text-sm font-medium text-muted-foreground">Total Profit/Loss</h3>
              <p className={`text-2xl font-bold mt-2 ${
                (summary.totalGainLoss || 0) >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                ${summary.totalGainLoss?.toLocaleString() || '0'}
              </p>
            </CardItem>
          </CardBody>
        </CardContainer>

        <CardContainer>
          <CardBody>
            <CardItem>
              <h3 className="text-sm font-medium text-muted-foreground">Number of Assets</h3>
              <p className="text-2xl font-bold mt-2">{assets.length}</p>
            </CardItem>
          </CardBody>
        </CardContainer>
      </div>

      {/* Portfolio Chart */}
      <div className="mb-6">
        <InteractiveChart
          data={chartData}
          height={300}
          tooltipFormatter={(value) => `$${value.toLocaleString()}`}
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="assets">
          <Card className="p-6">
            <AssetList assets={assets} />
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="p-6">
            <TransactionHistory assets={assets} />
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card className="p-6">
            <PriceAlerts assets={assets} />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Asset Form Dialog */}
      <AssetForm
        isOpen={isAddAssetOpen}
        onClose={() => setIsAddAssetOpen(false)}
        mode="add"
      />
    </PageContainer>
  );
}
