'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '@/contexts/PortfolioContext';

interface TaxLot {
  id: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: Date;
  salePrice?: number;
  saleDate?: Date;
  gainLoss?: number;
  holdingPeriod?: number;
  isLongTerm?: boolean;
}

interface TaxSummary {
  totalRealizedGains: number;
  totalRealizedLosses: number;
  netGainLoss: number;
  longTermGains: number;
  shortTermGains: number;
  washSales: number;
  capitalLossCarryover: number;
  estimatedTaxLiability: number;
}

interface TaxYearData {
  year: number;
  summary: TaxSummary;
  lots: TaxLot[];
  transactions: any[]; // Using the Transaction type from PortfolioContext
}

export function useTaxReport() {
  const { state } = usePortfolio();
  const [taxData, setTaxData] = useState<{ [year: number]: TaxYearData }>({});
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTaxData = useCallback(async (year: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tax/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year,
          transactions: state.transactions,
          positions: state.positions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate tax data');
      }

      const yearData: TaxYearData = await response.json();
      
      setTaxData(prev => ({
        ...prev,
        [year]: yearData,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate tax data');
      console.error('Tax calculation failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [state.transactions, state.positions]);

  useEffect(() => {
    if (selectedYear) {
      calculateTaxData(selectedYear);
    }
  }, [selectedYear, calculateTaxData]);

  const generateTaxReport = useCallback(async (year: number, format: 'PDF' | 'CSV' = 'PDF') => {
    try {
      const response = await fetch('/api/tax/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year,
          format,
          taxData: taxData[year],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate tax report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax_report_${year}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Tax report generation failed:', err);
      throw err;
    }
  }, [taxData]);

  const calculateWashSales = useCallback((lots: TaxLot[]): TaxLot[] => {
    const washSaleLots: TaxLot[] = [];
    const thirtyDays = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

    lots.forEach(lot => {
      if (lot.salePrice && lot.saleDate) {
        const potentialWashSales = lots.filter(otherLot => 
          otherLot.symbol === lot.symbol &&
          otherLot.purchaseDate.getTime() - lot.saleDate!.getTime() <= thirtyDays &&
          otherLot.purchaseDate.getTime() - lot.saleDate!.getTime() > 0
        );

        if (potentialWashSales.length > 0) {
          washSaleLots.push(lot);
        }
      }
    });

    return washSaleLots;
  }, []);

  const getHoldingPeriod = useCallback((lot: TaxLot): number => {
    const endDate = lot.saleDate || new Date();
    return Math.floor((endDate.getTime() - lot.purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
  }, []);

  const estimateTaxLiability = useCallback((summary: TaxSummary): number => {
    // Simplified tax calculation - should be replaced with actual tax brackets and rules
    const longTermRate = 0.20; // 20% for long-term gains
    const shortTermRate = 0.37; // 37% for short-term gains (highest marginal rate)

    return (summary.longTermGains * longTermRate) + 
           (summary.shortTermGains * shortTermRate);
  }, []);

  return {
    taxData,
    selectedYear,
    isLoading,
    error,
    setSelectedYear,
    calculateTaxData,
    generateTaxReport,
    calculateWashSales,
    getHoldingPeriod,
    estimateTaxLiability,
  };
} 