'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTechnicalAnalysis } from './useTechnicalAnalysis';
import { useRiskMetrics } from './useRiskMetrics';

interface AISignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  targetPrice: number;
  stopLoss: number;
  timeframe: string;
  reasoning: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: string;
}

interface MarketCondition {
  trend: string;
  volatility: number;
  sentiment: number;
  keyEvents: string[];
}

interface AIAnalysis {
  signals: AISignal[];
  marketCondition: MarketCondition;
  portfolioRecommendations: string[];
  riskWarnings: string[];
}

export function useAISignals(symbols: string[]) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Get technical analysis data for the first symbol (main focus)
  const { indicators, chartData } = useTechnicalAnalysis(symbols[0]);
  const { metrics: riskMetrics } = useRiskMetrics();

  const generateSignals = useCallback(async () => {
    if (!symbols.length || !indicators || !chartData.length) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbols,
          technicalData: {
            indicators,
            chartData,
          },
          riskMetrics,
          marketData: await fetchMarketData(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI signals');
      }

      const aiAnalysis: AIAnalysis = await response.json();
      setAnalysis(aiAnalysis);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate AI signals');
      console.error('AI signal generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [symbols, indicators, chartData, riskMetrics]);

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/market/conditions');
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }
      return await response.json();
    } catch (error) {
      console.error('Market data fetch failed:', error);
      return null;
    }
  };

  useEffect(() => {
    generateSignals();
    
    // Set up periodic updates (every 5 minutes)
    const intervalId = setInterval(generateSignals, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [generateSignals]);

  const getSignalForSymbol = useCallback((symbol: string): AISignal | null => {
    return analysis?.signals.find(signal => signal.symbol === symbol) || null;
  }, [analysis]);

  const getRiskWarnings = useCallback((): string[] => {
    return analysis?.riskWarnings || [];
  }, [analysis]);

  const getPortfolioRecommendations = useCallback((): string[] => {
    return analysis?.portfolioRecommendations || [];
  }, [analysis]);

  const getMarketCondition = useCallback((): MarketCondition | null => {
    return analysis?.marketCondition || null;
  }, [analysis]);

  const getSignalConfidence = useCallback((signal: AISignal): string => {
    if (signal.confidence >= 0.8) return 'Very High';
    if (signal.confidence >= 0.6) return 'High';
    if (signal.confidence >= 0.4) return 'Medium';
    if (signal.confidence >= 0.2) return 'Low';
    return 'Very Low';
  }, []);

  return {
    analysis,
    isLoading,
    error,
    lastUpdate,
    generateSignals,
    getSignalForSymbol,
    getRiskWarnings,
    getPortfolioRecommendations,
    getMarketCondition,
    getSignalConfidence,
  };
} 