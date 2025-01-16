'use client';

import { useEffect, useState } from 'react';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { SparklesCore } from '@/components/ui/sparkles';
import { InteractiveChart } from '@/components/ui/interactive-chart';

interface HistoricalPerformanceProps {
  portfolio: any;
}

export function HistoricalPerformance({ portfolio }: HistoricalPerformanceProps) {
  const { assets = [] } = portfolio || {};
  const [historicalData, setHistoricalData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    if (!assets.length) return;
    setHistoricalData(generateHistoricalData(assets));
  }, [assets]);

  if (!assets.length) {
    return (
      <CardContainer>
        <CardBody>
          <CardItem>
            <div className="text-center text-muted-foreground">
              No historical data available
            </div>
          </CardItem>
        </CardBody>
      </CardContainer>
    );
  }

  return (
    <div className="relative">
      <SparklesCore
        id="historical-sparkles"
        background="transparent"
        minSize={0.4}
        maxSize={1}
        particleDensity={30}
        className="absolute top-0 left-0 w-full h-full"
        particleColor="hsl(var(--primary))"
      />
      <div className="relative z-10">
        <h3 className="text-lg font-semibold mb-4">Portfolio Value Over Time</h3>
        <div className="h-[400px]">
          <InteractiveChart
            data={historicalData}
            height={400}
            tooltipFormatter={(value) => `$${value.toLocaleString()}`}
          />
        </div>
      </div>
    </div>
  );
}

// Helper function to generate sample historical data
function generateHistoricalData(assets: any[]) {
  const dates = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }

  return dates.map(date => {
    const totalValue = assets.reduce((sum, asset) => {
      const randomChange = 1 + (Math.random() - 0.5) * 0.1;
      return sum + (asset.metrics.currentValue * randomChange);
    }, 0);

    return {
      name: date.toLocaleDateString(),
      value: totalValue
    };
  });
} 