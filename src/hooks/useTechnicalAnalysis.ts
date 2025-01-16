'use client';

import { useState, useEffect, useCallback } from 'react';

interface TechnicalIndicators {
  sma: number[];
  ema: number[];
  rsi: number[];
  macd: {
    macdLine: number[];
    signalLine: number[];
    histogram: number[];
  };
  bollinger: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
  volume: number[];
}

interface ChartData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface IndicatorParams {
  smaPeriod?: number;
  emaPeriod?: number;
  rsiPeriod?: number;
  macdParams?: {
    fastPeriod: number;
    slowPeriod: number;
    signalPeriod: number;
  };
  bollingerParams?: {
    period: number;
    standardDeviations: number;
  };
}

export function useTechnicalAnalysis(symbol: string, timeframe: string = '1D') {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = useCallback(async () => {
    if (!symbol) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/market/chart-data?symbol=${symbol}&timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }

      const data = await response.json();
      setChartData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
      console.error('Chart data fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeframe]);

  const calculateIndicators = useCallback(async (params: IndicatorParams = {}) => {
    if (!chartData.length) return;

    try {
      const response = await fetch('/api/technical/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: chartData,
          params: {
            smaPeriod: params.smaPeriod || 20,
            emaPeriod: params.emaPeriod || 20,
            rsiPeriod: params.rsiPeriod || 14,
            macdParams: params.macdParams || {
              fastPeriod: 12,
              slowPeriod: 26,
              signalPeriod: 9,
            },
            bollingerParams: params.bollingerParams || {
              period: 20,
              standardDeviations: 2,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate indicators');
      }

      const calculatedIndicators: TechnicalIndicators = await response.json();
      setIndicators(calculatedIndicators);
    } catch (err) {
      console.error('Indicator calculation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate indicators');
    }
  }, [chartData]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  useEffect(() => {
    if (chartData.length > 0) {
      calculateIndicators();
    }
  }, [chartData, calculateIndicators]);

  const getSignals = useCallback(() => {
    if (!indicators) return null;

    const lastIndex = chartData.length - 1;
    const signals = {
      trend: determineTrend(chartData, indicators, lastIndex),
      rsiSignal: analyzeRSI(indicators.rsi[lastIndex]),
      macdSignal: analyzeMACD(
        indicators.macd.macdLine[lastIndex],
        indicators.macd.signalLine[lastIndex],
        indicators.macd.histogram[lastIndex]
      ),
      bollingerSignal: analyzeBollinger(
        chartData[lastIndex].close,
        indicators.bollinger.upper[lastIndex],
        indicators.bollinger.lower[lastIndex]
      ),
    };

    return signals;
  }, [chartData, indicators]);

  return {
    chartData,
    indicators,
    isLoading,
    error,
    calculateIndicators,
    getSignals,
    fetchChartData,
  };
}

// Helper functions for technical analysis
function determineTrend(
  data: ChartData[],
  indicators: TechnicalIndicators,
  index: number
): 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS' {
  const sma = indicators.sma[index];
  const price = data[index].close;
  const prevPrice = data[index - 1]?.close;

  if (price > sma && prevPrice > sma) return 'UPTREND';
  if (price < sma && prevPrice < sma) return 'DOWNTREND';
  return 'SIDEWAYS';
}

function analyzeRSI(rsi: number): 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL' {
  if (rsi >= 70) return 'OVERBOUGHT';
  if (rsi <= 30) return 'OVERSOLD';
  return 'NEUTRAL';
}

function analyzeMACD(
  macdLine: number,
  signalLine: number,
  histogram: number
): 'BUY' | 'SELL' | 'NEUTRAL' {
  if (macdLine > signalLine && histogram > 0) return 'BUY';
  if (macdLine < signalLine && histogram < 0) return 'SELL';
  return 'NEUTRAL';
}

function analyzeBollinger(
  price: number,
  upper: number,
  lower: number
): 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL' {
  if (price >= upper) return 'OVERBOUGHT';
  if (price <= lower) return 'OVERSOLD';
  return 'NEUTRAL';
} 