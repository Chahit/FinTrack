'use client';

import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/ui/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceMetrics } from './components/PerformanceMetrics';
import { RiskAnalysis } from './components/RiskAnalysis';
import { TradingViewWidget } from './components/TradingViewWidget';
import { PortfolioCorrelation } from './components/PortfolioCorrelation';
import { HistoricalPerformance } from './components/HistoricalPerformance';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { SparklesCore } from '@/components/ui/sparkles';
import { SkeletonCard, SkeletonChartCard } from '@/components/ui/skeleton-card';

// Fetch portfolio data
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
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <SkeletonCard className="w-[250px] h-[40px]" />
          </div>

          {/* Tabs Skeleton */}
          <SkeletonCard className="w-full h-[40px]" />

          {/* Content Skeleton */}
          <div className="space-y-4">
            <SkeletonChartCard className="h-[800px]" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SkeletonChartCard />
              <SkeletonChartCard />
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <CardContainer>
          <CardBody>
            <CardItem>
              <div className="text-center text-red-500">
                Error loading analytics data. Please try again later.
              </div>
            </CardItem>
          </CardBody>
        </CardContainer>
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
          particleDensity={50}
          className="absolute top-0 left-0 w-full h-full"
          particleColor="hsl(var(--primary))"
        />

        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-center">
            <CardContainer className="max-w-lg">
              <CardBody>
                <CardItem>
                  <h1 className="text-3xl font-bold">Portfolio Analytics</h1>
                </CardItem>
              </CardBody>
            </CardContainer>
          </div>

          <Tabs defaultValue="market" className="space-y-4">
            <CardContainer>
              <CardBody>
                <CardItem>
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="market">Market Overview</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
                    <TabsTrigger value="correlation">Correlation</TabsTrigger>
                  </TabsList>
                </CardItem>
              </CardBody>
            </CardContainer>

            <TabsContent value="market">
              <CardContainer>
                <CardBody>
                  <CardItem>
                    <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
                    <TradingViewWidget />
                  </CardItem>
                </CardBody>
              </CardContainer>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <CardContainer>
                  <CardBody>
                    <CardItem>
                      <HistoricalPerformance portfolio={portfolio} />
                    </CardItem>
                  </CardBody>
                </CardContainer>
                <CardContainer>
                  <CardBody>
                    <CardItem>
                      <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                      <PerformanceMetrics portfolio={portfolio} />
                    </CardItem>
                  </CardBody>
                </CardContainer>
              </div>
            </TabsContent>

            <TabsContent value="risk" className="space-y-4">
              <CardContainer>
                <CardBody>
                  <CardItem>
                    <h3 className="text-lg font-semibold mb-4">Risk Metrics</h3>
                    <RiskAnalysis portfolio={portfolio} />
                  </CardItem>
                </CardBody>
              </CardContainer>
            </TabsContent>

            <TabsContent value="correlation" className="space-y-4">
              <CardContainer>
                <CardBody>
                  <CardItem>
                    <h3 className="text-lg font-semibold mb-4">Asset Correlation</h3>
                    <PortfolioCorrelation assets={assets} />
                  </CardItem>
                </CardBody>
              </CardContainer>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
}
