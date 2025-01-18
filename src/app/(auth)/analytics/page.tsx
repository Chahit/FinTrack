'use client';

import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/ui/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceMetrics } from './components/PerformanceMetrics';
import { RiskAnalysis } from './components/RiskAnalysis';
import { TradingViewWidget } from './components/TradingViewWidget';
import { HistoricalPerformance } from './components/HistoricalPerformance';
import { SparklesCore } from '@/components/ui/sparkles';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { FlatCard, FlatCardHeader, FlatCardContent } from '@/components/ui/flat-card';
import { BarChart, LineChart, TrendingUp } from 'lucide-react';

async function fetchPortfolioData() {
  const response = await fetch('/api/portfolio/assets');
  if (!response.ok) {
    throw new Error('Failed to fetch portfolio data');
  }
  return response.json();
}

export default function AnalyticsPage() {
  const { data: portfolio, isLoading, error } = useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolioData,
  });

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <SkeletonCard className="w-[250px] h-[40px]" />
          </div>

          {/* Tabs Skeleton */}
          <SkeletonCard className="w-full h-[40px]" />

          {/* Content Skeleton */}
          <div className="space-y-6">
            <SkeletonCard className="h-[400px]" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonCard className="h-[300px]" />
              <SkeletonCard className="h-[300px]" />
            </div>
          </div>
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
              Error loading analytics data. Please try again later.
            </div>
          </FlatCardContent>
        </FlatCard>
      </PageContainer>
    );
  }

  const { assets = [], summary = {} } = portfolio || {};

  return (
    <PageContainer>
      <div className="relative">
        <SparklesCore
          id="analytics-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={30}
          className="absolute top-0 left-0 w-full h-full opacity-50"
          particleColor="hsl(var(--primary))"
        />

        <div className="relative z-10 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <FlatCard>
              <FlatCardHeader>
                <h1 className="text-4xl font-bold tracking-tight">Portfolio Analytics</h1>
              </FlatCardHeader>
            </FlatCard>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="market" className="space-y-6">
            <FlatCard>
              <FlatCardContent>
                <TabsList className="w-full justify-start border-b light:border-black">
                  <TabsTrigger value="market" className="gap-2">
                    <BarChart className="h-4 w-4" />
                    Market Overview
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Performance
                  </TabsTrigger>
                  <TabsTrigger value="risk" className="gap-2">
                    <LineChart className="h-4 w-4" />
                    Risk Analysis
                  </TabsTrigger>
                </TabsList>
              </FlatCardContent>
            </FlatCard>

            <TabsContent value="market">
              <FlatCard>
                <FlatCardHeader>
                  <h2 className="text-2xl font-semibold tracking-tight">Market Overview</h2>
                </FlatCardHeader>
                <FlatCardContent>
                  <div className="h-[600px]">
                    <TradingViewWidget />
                  </div>
                </FlatCardContent>
              </FlatCard>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <FlatCard>
                <FlatCardHeader>
                  <h2 className="text-2xl font-semibold tracking-tight">Historical Performance</h2>
                </FlatCardHeader>
                <FlatCardContent>
                  <div className="h-[400px]">
                    <HistoricalPerformance portfolio={portfolio} />
                  </div>
                </FlatCardContent>
              </FlatCard>

              <FlatCard>
                <FlatCardHeader>
                  <h2 className="text-2xl font-semibold tracking-tight">Performance Metrics</h2>
                </FlatCardHeader>
                <FlatCardContent>
                  <PerformanceMetrics portfolio={portfolio} />
                </FlatCardContent>
              </FlatCard>
            </TabsContent>

            <TabsContent value="risk">
              <FlatCard>
                <FlatCardHeader>
                  <h2 className="text-2xl font-semibold tracking-tight">Risk Analysis</h2>
                </FlatCardHeader>
                <FlatCardContent>
                  <div className="h-[500px]">
                    <RiskAnalysis portfolio={portfolio} />
                  </div>
                </FlatCardContent>
              </FlatCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
}
