'use client';

import { useState, useCallback } from 'react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useToast } from '@/components/ui/use-toast';

interface TradeParams {
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  orderType: 'MARKET' | 'LIMIT';
  limitPrice?: number;
}

interface TradeResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export function useTrade() {
  const [isExecuting, setIsExecuting] = useState(false);
  const { dispatch } = usePortfolio();
  const { toast } = useToast();

  const validateTrade = useCallback((params: TradeParams): string | null => {
    if (!params.symbol) return 'Symbol is required';
    if (!params.quantity || params.quantity <= 0) return 'Invalid quantity';
    if (params.orderType === 'LIMIT' && (!params.limitPrice || params.limitPrice <= 0)) {
      return 'Invalid limit price';
    }
    return null;
  }, []);

  const executeTrade = useCallback(async (params: TradeParams): Promise<TradeResult> => {
    const validationError = validateTrade(params);
    if (validationError) {
      return { success: false, error: validationError };
    }

    setIsExecuting(true);

    try {
      const response = await fetch('/api/trade/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Trade execution failed');
      }

      // Add the transaction to portfolio state
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: {
          id: data.transactionId,
          symbol: params.symbol,
          type: params.type,
          quantity: params.quantity,
          price: data.executedPrice || params.price,
          timestamp: new Date(),
        },
      });

      toast({
        title: 'Trade Executed',
        description: `Successfully ${params.type.toLowerCase()}ed ${params.quantity} shares of ${params.symbol}`,
      });

      return {
        success: true,
        transactionId: data.transactionId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Trade execution failed';
      
      toast({
        title: 'Trade Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsExecuting(false);
    }
  }, [dispatch, toast, validateTrade]);

  const previewTrade = useCallback(async (params: TradeParams) => {
    try {
      const response = await fetch('/api/trade/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to preview trade');
      }

      return {
        estimatedPrice: data.estimatedPrice,
        estimatedFees: data.estimatedFees,
        estimatedTotal: data.estimatedTotal,
        marketImpact: data.marketImpact,
      };
    } catch (error) {
      console.error('Trade preview failed:', error);
      return null;
    }
  }, []);

  return {
    executeTrade,
    previewTrade,
    isExecuting,
  };
} 