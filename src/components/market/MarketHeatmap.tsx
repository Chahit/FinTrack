'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";

interface HeatmapItem {
  name: string;
  symbol: string;
  change: number;
  marketCap: number;
}

export function MarketHeatmap() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sectors = [
    {
      name: "Technology",
      items: [
        { name: "Apple", symbol: "AAPL", change: 2.5, marketCap: 3000 },
        { name: "Microsoft", symbol: "MSFT", change: 1.8, marketCap: 2800 },
        { name: "NVIDIA", symbol: "NVDA", change: 3.2, marketCap: 1200 },
      ]
    },
    {
      name: "Finance",
      items: [
        { name: "JPMorgan", symbol: "JPM", change: -0.5, marketCap: 500 },
        { name: "Bank of America", symbol: "BAC", change: -1.2, marketCap: 300 },
        { name: "Visa", symbol: "V", change: 0.8, marketCap: 450 },
      ]
    },
    {
      name: "Healthcare",
      items: [
        { name: "Johnson & Johnson", symbol: "JNJ", change: 0.3, marketCap: 400 },
        { name: "UnitedHealth", symbol: "UNH", change: -0.7, marketCap: 350 },
        { name: "Pfizer", symbol: "PFE", change: -2.1, marketCap: 200 },
      ]
    },
  ];

  const getColor = (change: number) => {
    const intensity = Math.min(Math.abs(change) * 20, 100);
    if (change > 0) {
      return isDark 
        ? `rgba(34, 197, 94, ${intensity / 100})` 
        : `rgba(21, 128, 61, ${intensity / 100})`;
    }
    return isDark
      ? `rgba(239, 68, 68, ${intensity / 100})`
      : `rgba(185, 28, 28, ${intensity / 100})`;
  };

  const getSize = (marketCap: number) => {
    const baseSize = 100;
    const scale = Math.log(marketCap) / Math.log(3000); // Normalize based on max market cap
    return Math.max(baseSize * scale, 60); // Minimum size of 60px
  };

  return (
    <div className="space-y-6">
      {sectors.map((sector) => (
        <Card key={sector.name}>
          <CardHeader>
            <CardTitle>{sector.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {sector.items.map((item) => {
                const size = getSize(item.marketCap);
                return (
                  <div
                    key={item.symbol}
                    className="flex items-center justify-center rounded-lg p-4 transition-colors"
                    style={{
                      width: size,
                      height: size,
                      backgroundColor: getColor(item.change),
                    }}
                  >
                    <div className="text-center">
                      <div className="font-medium">{item.symbol}</div>
                      <div className={`text-sm ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {item.change > 0 ? '+' : ''}{item.change}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
