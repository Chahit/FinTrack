'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AssetBreakdownProps {
  assets: any[];
}

export function AssetBreakdown({ assets }: AssetBreakdownProps) {
  if (!assets.length) {
    return (
      <div className="text-center text-muted-foreground">
        No assets to display
      </div>
    );
  }

  // Calculate allocation data
  const allocationData = assets.map(asset => ({
    name: asset.symbol,
    value: asset.metrics.currentValue,
    type: asset.type,
    return: asset.metrics.gainLossPercentage,
  }));

  // Sort by value
  allocationData.sort((a, b) => b.value - a.value);

  // Colors for different asset types
  const COLORS = {
    crypto: '#8884d8',
    stock: '#82ca9d',
  };

  return (
    <div className="space-y-6">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={allocationData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {allocationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.type as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {allocationData.map((asset, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[asset.type as keyof typeof COLORS] }}
              />
              <span>{asset.name}</span>
            </div>
            <div className="text-right">
              <p className="font-medium">${asset.value.toFixed(2)}</p>
              <p className={`text-sm ${asset.return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {asset.return >= 0 ? '+' : ''}{asset.return.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 