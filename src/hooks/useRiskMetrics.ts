'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '@/contexts/PortfolioContext';

interface RiskMetrics {
  sharpeRatio: number;
  beta: number;
  alpha: number;
  valueAtRisk: number;
  maxDrawdown: number;
  volatility: number;
  correlationMatrix: { [symbol: string]: { [symbol: string]: number } };
}

interface HistoricalData {
  symbol: string;
  returns: number[];
  dates: string[];
}

export function useRiskMetrics() {
  const { state } = usePortfolio();
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateMetrics = useCallback(async () => {
    if (!state.positions.length) {
      setMetrics(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch historical data for all positions
      const symbols = state.positions.map(pos => pos.symbol);
      const response = await fetch('/api/market/historical-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbols }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }

      const historicalData: HistoricalData[] = await response.json();

      // Calculate risk metrics
      const riskResponse = await fetch('/api/risk/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          positions: state.positions,
          historicalData,
        }),
      });

      if (!riskResponse.ok) {
        throw new Error('Failed to calculate risk metrics');
      }

      const riskMetrics: RiskMetrics = await riskResponse.json();
      setMetrics(riskMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate risk metrics');
      console.error('Risk metrics calculation failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [state.positions]);

  useEffect(() => {
    calculateMetrics();
  }, [calculateMetrics]);

  const getPositionRisk = useCallback((symbol: string) => {
    if (!metrics) return null;

    return {
      beta: metrics.beta,
      valueAtRisk: metrics.valueAtRisk * (state.positions.find(p => p.symbol === symbol)?.marketValue || 0),
      contribution: calculateRiskContribution(symbol, metrics, state.positions),
    };
  }, [metrics, state.positions]);

  const calculateRiskContribution = (
    symbol: string,
    metrics: RiskMetrics,
    positions: typeof state.positions
  ) => {
    const position = positions.find(p => p.symbol === symbol);
    if (!position) return 0;

    const totalValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0);
    const weight = position.marketValue / totalValue;

    return weight * metrics.beta;
  };

  const getCorrelation = useCallback((symbol1: string, symbol2: string): number => {
    if (!metrics?.correlationMatrix) return 0;
    return metrics.correlationMatrix[symbol1]?.[symbol2] || 0;
  }, [metrics]);

  return {
    metrics,
    isLoading,
    error,
    calculateMetrics,
    getPositionRisk,
    getCorrelation,
  };
} 