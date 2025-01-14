'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TradingViewWidget } from "@/components/trading/TradingViewWidget";
import { useTheme } from 'next-themes';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AssetForm } from '@/components/dashboard/AssetForm';
import { MarketNews } from '@/components/market/MarketNews';
import { FinanceAgent } from '@/components/ai/FinanceAgent';
import { RiskAnalysisChart } from '@/components/charts/RiskAnalysisChart';
import { AllocationChart } from '@/components/charts/AllocationChart';

interface Asset {
  name: string;
  symbol: string;
  price: number;
  change: number;
  marketCap: number;
  volume: number;
}

interface PortfolioData {
  date: string;
  value: number;
}

export default function DashboardPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([]);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    // Fetch real-time market data
    const fetchMarketData = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false');
        const data = await response.json();
        
        const formattedData = data.map((coin: any) => ({
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          price: coin.current_price,
          change: coin.price_change_percentage_24h,
          marketCap: coin.market_cap,
          volume: coin.total_volume,
        }));

        setAssets(formattedData);
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Generate sample portfolio data (replace with real data)
    const generatePortfolioData = () => {
      const data = [];
      const now = new Date();
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toISOString().split('T')[0],
          value: 100000 + Math.random() * 20000
        });
      }
      setPortfolioData(data);
    };

    generatePortfolioData();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      {/* Portfolio Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$123,456</div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+$1,234</div>
            <p className="text-xs text-muted-foreground">+1.2% today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Across 5 categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Medium</div>
            <p className="text-xs text-muted-foreground">Based on portfolio diversity</p>
          </CardContent>
        </Card>
      </div>

      {/* Asset Form */}
      <AssetForm />

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <AllocationChart />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <RiskAnalysisChart />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={portfolioData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#eee'} />
                <XAxis 
                  dataKey="date" 
                  stroke={isDark ? '#888' : '#666'}
                  tick={{ fill: isDark ? '#888' : '#666' }}
                />
                <YAxis 
                  stroke={isDark ? '#888' : '#666'}
                  tick={{ fill: isDark ? '#888' : '#666' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1a1a1a' : '#fff',
                    border: `1px solid ${isDark ? '#333' : '#ddd'}`,
                    color: isDark ? '#fff' : '#000'
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Market Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assets.slice(0, 5).map((asset) => (
                <div key={asset.symbol} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-sm text-muted-foreground">{asset.symbol}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${asset.price.toLocaleString()}</div>
                    <div className={`text-sm ${asset.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <TradingViewWidget symbol="BTCUSD" height={300} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market News */}
      <MarketNews />

      {/* AI Finance Assistant */}
      <FinanceAgent />
    </div>
  );
}
