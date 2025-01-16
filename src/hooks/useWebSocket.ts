import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@clerk/nextjs';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  dividend: number;
  high52Week: number;
  low52Week: number;
}

interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface UseWebSocketOptions {
  symbols?: string[];
  enablePortfolioUpdates?: boolean;
}

export function useWebSocket({ symbols = [], enablePortfolioUpdates = false }: UseWebSocketOptions = {}) {
  const { userId } = useAuth();
  const socket = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [historicalData, setHistoricalData] = useState<Record<string, HistoricalData[]>>({});
  const [portfolioValue, setPortfolioValue] = useState<number | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socket.current = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');

    // Set up event listeners
    socket.current.on('connect', () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    });

    socket.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    });

    socket.current.on('marketData', ({ symbol, data }: { symbol: string; data: MarketData }) => {
      setMarketData(prev => ({
        ...prev,
        [symbol]: data
      }));
    });

    socket.current.on('historicalData', ({ symbol, data }: { symbol: string; data: HistoricalData[] }) => {
      setHistoricalData(prev => ({
        ...prev,
        [symbol]: data
      }));
    });

    socket.current.on('priceUpdate', ({ symbol, data }: { symbol: string; data: MarketData }) => {
      setMarketData(prev => ({
        ...prev,
        [symbol]: {
          ...(prev[symbol] || {}),
          ...data
        }
      }));
    });

    if (enablePortfolioUpdates && userId) {
      socket.current.on(`portfolio:${userId}`, ({ totalValue, lastUpdate }) => {
        setPortfolioValue(totalValue);
      });
    }

    // Cleanup on unmount
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [userId, enablePortfolioUpdates]);

  // Subscribe to symbols when they change
  useEffect(() => {
    if (socket.current && isConnected && symbols.length > 0) {
      socket.current.emit('subscribe', symbols);

      return () => {
        socket.current?.emit('unsubscribe', symbols);
      };
    }
  }, [symbols, isConnected]);

  // Subscribe to portfolio updates
  useEffect(() => {
    if (socket.current && isConnected && enablePortfolioUpdates && userId) {
      socket.current.emit('portfolio', userId);
    }
  }, [userId, enablePortfolioUpdates, isConnected]);

  const subscribeToSymbol = useCallback((symbol: string) => {
    if (socket.current && isConnected) {
      socket.current.emit('subscribe', [symbol]);
    }
  }, [isConnected]);

  const unsubscribeFromSymbol = useCallback((symbol: string) => {
    if (socket.current && isConnected) {
      socket.current.emit('unsubscribe', [symbol]);
    }
  }, [isConnected]);

  return {
    isConnected,
    marketData,
    historicalData,
    portfolioValue,
    subscribeToSymbol,
    unsubscribeFromSymbol
  };
}
