'use client';

import { MarketNews } from '@/components/market/MarketNews';
import { MarketScreener } from '@/components/screener/MarketScreener';
import { TradingViewWidget } from '@/components/trading/TradingViewWidget';
import { MarketSentiment } from '@/components/market/MarketSentiment';
import { TechnicalAnalysis } from '@/components/analytics/TechnicalAnalysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketHeatmap } from '@/components/market/MarketHeatmap';

export default function MarketPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Market Overview</h1>

      {/* Market Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">S&P 500</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,783.83</div>
            <p className="text-xs text-green-500">+1.23%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bitcoin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$42,567.89</div>
            <p className="text-xs text-red-500">-0.45%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,034.50</div>
            <p className="text-xs text-green-500">+0.78%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Fear & Greed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">65</div>
            <p className="text-xs text-muted-foreground">Greed</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
          <TabsTrigger value="heatmap">Market Heatmap</TabsTrigger>
          <TabsTrigger value="sentiment">Market Sentiment</TabsTrigger>
        </TabsList>
        <TabsContent value="chart" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <TradingViewWidget symbol="AAPL" height={600} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="technical" className="space-y-4">
          <TechnicalAnalysis />
        </TabsContent>
        <TabsContent value="heatmap" className="space-y-4">
          <MarketHeatmap />
        </TabsContent>
        <TabsContent value="sentiment" className="space-y-4">
          <MarketSentiment />
        </TabsContent>
      </Tabs>

      {/* Market Screener */}
      <Card>
        <CardHeader>
          <CardTitle>Market Screener</CardTitle>
        </CardHeader>
        <CardContent>
          <MarketScreener />
        </CardContent>
      </Card>

      {/* Market News */}
      <MarketNews />
    </div>
  );
}