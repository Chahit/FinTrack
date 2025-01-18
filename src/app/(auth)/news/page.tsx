'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/ui/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortfolioNewsFeed } from './components/PortfolioNewsFeed';
import { MarketNewsFeed } from './components/MarketNewsFeed';
import { NewsAnalysis } from './components/NewsAnalysis';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { SkeletonCard } from '@/components/ui/skeleton-card';

async function fetchPortfolioSymbols() {
  const response = await fetch('/api/portfolio/assets');
  if (!response.ok) {
    throw new Error('Failed to fetch portfolio data');
  }
  const data = await response.json();
  return data.assets.map((asset: any) => asset.symbol);
}

export default function NewsPage() {
  const [bookmarkedNews] = useState(new Set<number>());
  const { data: portfolioSymbols = [], isLoading, error } = useQuery({
    queryKey: ['portfolio-symbols'],
    queryFn: fetchPortfolioSymbols,
  });

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SkeletonCard className="h-[200px]" />
              <div className="mt-6 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} className="h-[150px]" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <SkeletonCard className="h-[500px]" />
            </div>
          </div>
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

  return (
    <PageContainer>
      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* News Feed */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="market" className="space-y-6">
              <TabsList>
                <TabsTrigger value="market">Market News</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio News</TabsTrigger>
              </TabsList>
              <TabsContent value="market">
                <MarketNewsFeed
                  bookmarkedNews={bookmarkedNews}
                />
              </TabsContent>
              <TabsContent value="portfolio">
                <PortfolioNewsFeed
                  portfolioSymbols={portfolioSymbols}
                  bookmarkedNews={bookmarkedNews}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Analysis */}
          <div className="lg:col-span-1">
            <NewsAnalysis newsItems={[]} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
