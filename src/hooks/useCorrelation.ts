'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '@/contexts/PortfolioContext';

interface CorrelationData {
  matrix: number[][];
  symbols: string[];
  timeframe: string;
  startDate: string;
  endDate: string;
}

interface CorrelationStats {
  averageCorrelation: number;
  highestCorrelation: {
    symbols: [string, string];
    value: number;
  };
  lowestCorrelation: {
    symbols: [string, string];
    value: number;
  };
  diversificationScore: number;
}

interface RollingCorrelation {
  dates: string[];
  values: number[];
  symbol1: string;
  symbol2: string;
}

export function useCorrelation() {
  const { state } = usePortfolio();
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null);
  const [stats, setStats] = useState<CorrelationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateCorrelations = useCallback(async (
    timeframe: string = '1Y',
    customSymbols?: string[]
  ) => {
    const symbols = customSymbols || state.positions.map(pos => pos.symbol);
    
    if (symbols.length < 2) {
      setError('Need at least 2 symbols to calculate correlations');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analysis/correlation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbols,
          timeframe,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate correlations');
      }

      const data: CorrelationData = await response.json();
      setCorrelationData(data);
      
      // Calculate correlation statistics
      const stats = calculateCorrelationStats(data);
      setStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate correlations');
      console.error('Correlation calculation failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [state.positions]);

  const calculateCorrelationStats = (data: CorrelationData): CorrelationStats => {
    let sum = 0;
    let count = 0;
    let highest = -1;
    let lowest = 1;
    let highestPair: [string, string] = [data.symbols[0], data.symbols[0]];
    let lowestPair: [string, string] = [data.symbols[0], data.symbols[0]];

    for (let i = 0; i < data.matrix.length; i++) {
      for (let j = i + 1; j < data.matrix[i].length; j++) {
        const value = data.matrix[i][j];
        sum += value;
        count++;

        if (value > highest) {
          highest = value;
          highestPair = [data.symbols[i], data.symbols[j]];
        }
        if (value < lowest) {
          lowest = value;
          lowestPair = [data.symbols[i], data.symbols[j]];
        }
      }
    }

    const averageCorrelation = sum / count;
    const diversificationScore = calculateDiversificationScore(data.matrix);

    return {
      averageCorrelation,
      highestCorrelation: {
        symbols: highestPair,
        value: highest,
      },
      lowestCorrelation: {
        symbols: lowestPair,
        value: lowest,
      },
      diversificationScore,
    };
  };

  const calculateDiversificationScore = (matrix: number[][]): number => {
    // Calculate diversification score based on eigenvalue analysis
    // Higher score indicates better diversification
    let sum = 0;
    const n = matrix.length;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          sum += Math.abs(matrix[i][j]);
        }
      }
    }

    const averageCorrelation = sum / (n * (n - 1));
    return 1 - averageCorrelation;
  };

  const getRollingCorrelation = useCallback(async (
    symbol1: string,
    symbol2: string,
    windowSize: number = 30,
    timeframe: string = '1Y'
  ): Promise<RollingCorrelation> => {
    try {
      const response = await fetch('/api/analysis/rolling-correlation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol1,
          symbol2,
          windowSize,
          timeframe,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate rolling correlation');
      }

      return await response.json();
    } catch (error) {
      console.error('Rolling correlation calculation failed:', error);
      throw error;
    }
  }, []);

  const getCorrelationValue = useCallback((symbol1: string, symbol2: string): number | null => {
    if (!correlationData) return null;

    const index1 = correlationData.symbols.indexOf(symbol1);
    const index2 = correlationData.symbols.indexOf(symbol2);

    if (index1 === -1 || index2 === -1) return null;

    return correlationData.matrix[Math.min(index1, index2)][Math.max(index1, index2)];
  }, [correlationData]);

  return {
    correlationData,
    stats,
    isLoading,
    error,
    calculateCorrelations,
    getRollingCorrelation,
    getCorrelationValue,
  };
} 