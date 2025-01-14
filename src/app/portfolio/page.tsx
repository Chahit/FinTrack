'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortfolioChart } from "@/components/charts/PortfolioChart";
import { cn } from "@/lib/utils";

interface Asset {
  symbol: string;
  name: string;
  amount: number;
  price: number;
  value: number;
  change: number;
  allocation: number;
}

export default function PortfolioPage() {
  const assets: Asset[] = [
    {
      symbol: "BTC",
      name: "Bitcoin",
      amount: 0.5,
      price: 43567.89,
      value: 21783.945,
      change: 2.45,
      allocation: 35
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      amount: 4.2,
      price: 2345.67,
      value: 9851.814,
      change: -1.23,
      allocation: 25
    },
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      amount: 15,
      price: 178.90,
      value: 2683.5,
      change: 0.75,
      allocation: 20
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      amount: 8,
      price: 234.56,
      value: 1876.48,
      change: -2.34,
      allocation: 20
    }
  ];

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <div className="space-y-8">
      {/* Portfolio Overview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Portfolio Overview</h2>
          <div className="flex items-center space-x-2">
            <button className="btn-secondary">24h</button>
            <button className="btn-ghost">7d</button>
            <button className="btn-ghost">30d</button>
            <button className="btn-ghost">1y</button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalValue.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                +$1,234.56 (4.32%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                +2.45%
              </div>
              <p className="text-sm text-muted-foreground">
                +$567.89 today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assets.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Active positions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Best Performer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                BTC
              </div>
              <p className="text-sm text-green-500">
                +2.45% today
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Portfolio Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <PortfolioChart />
          </div>
        </CardContent>
      </Card>

      {/* Asset Allocation */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Asset Allocation</h2>
        <div className="grid gap-4">
          {assets.map((asset) => (
            <Card key={asset.symbol}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">{asset.name}</h3>
                    <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-medium">${asset.value.toLocaleString()}</div>
                    <p className={cn(
                      "text-sm",
                      asset.change > 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {asset.change > 0 ? "+" : ""}{asset.change}%
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Allocation</span>
                    <span>{asset.allocation}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-accent/10">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${asset.allocation}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
