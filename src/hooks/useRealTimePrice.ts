'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '@/contexts/PortfolioContext';

interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

export function useRealTimePrice(symbols: string[]) {
  const [prices, setPrices] = useState<{ [symbol: string]: number }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { dispatch } = usePortfolio();

  const handlePriceUpdate = useCallback((update: PriceUpdate) => {
    setPrices(prev => ({
      ...prev,
      [update.symbol]: update.price
    }));

    dispatch({
      type: 'UPDATE_PRICES',
      payload: { [update.symbol]: update.price }
    });
  }, [dispatch]);

  useEffect(() => {
    let ws: WebSocket;

    const connect = () => {
      try {
        ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');

        ws.onopen = () => {
          setIsConnected(true);
          setError(null);
          
          // Subscribe to symbols
          ws.send(JSON.stringify({
            type: 'subscribe',
            symbols
          }));
        };

        ws.onmessage = (event) => {
          try {
            const update: PriceUpdate = JSON.parse(event.data);
            handlePriceUpdate(update);
          } catch (err) {
            console.error('Failed to parse price update:', err);
          }
        };

        ws.onerror = (event) => {
          console.error('WebSocket error:', event);
          setError('WebSocket connection error');
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Attempt to reconnect after 5 seconds
          setTimeout(connect, 5000);
        };
      } catch (err) {
        setError('Failed to establish WebSocket connection');
        setIsConnected(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(connect, 5000);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [symbols, handlePriceUpdate]);

  const getPrice = useCallback((symbol: string) => {
    return prices[symbol] || null;
  }, [prices]);

  return {
    prices,
    getPrice,
    isConnected,
    error
  };
} 