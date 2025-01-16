'use client';

import { Card } from '@/components/ui/card';

interface PerformanceMetricsProps {
  portfolio: any;
}

export function PerformanceMetrics({ portfolio }: PerformanceMetricsProps) {
  const { summary, assets = [] } = portfolio || {};

  // Calculate additional metrics
  const calculateMetrics = () => {
    if (!assets.length) return null;

    // Calculate returns for different periods
    const dailyReturn = summary.totalGainLossPercentage || 0;
    
    // Calculate volatility (standard deviation of returns)
    const returns = assets.map(asset => asset.metrics.gainLossPercentage);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);

    // Calculate Sharpe Ratio (assuming risk-free rate of 2%)
    const riskFreeRate = 2;
    const sharpeRatio = (avgReturn - riskFreeRate) / volatility;

    return {
      dailyReturn,
      volatility,
      sharpeRatio,
      totalReturn: summary.totalGainLossPercentage || 0,
    };
  };

  const metrics = calculateMetrics();

  if (!metrics) {
    return (
      <div className="text-center text-muted-foreground">
        No performance data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Return</p>
          <p className={`text-2xl font-bold ${metrics.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {metrics.totalReturn.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Daily Return</p>
          <p className={`text-2xl font-bold ${metrics.dailyReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {metrics.dailyReturn.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Volatility</p>
          <p className="text-2xl font-bold">
            {metrics.volatility.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
          <p className="text-2xl font-bold">
            {metrics.sharpeRatio.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
} 