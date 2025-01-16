export const calculateRiskMetrics = {
  sharpeRatio: (returns: number[], riskFreeRate: number = 0.02): number => {
    const avgReturn = returns.reduce((a, b) => a + b) / returns.length;
    const stdDev = Math.sqrt(
      returns.reduce((sq, n) => sq + Math.pow(n - avgReturn, 2), 0) /
        (returns.length - 1)
    );
    return (avgReturn - riskFreeRate) / stdDev;
  },

  beta: (assetReturns: number[], marketReturns: number[]): number => {
    const avgAssetReturn = assetReturns.reduce((a, b) => a + b) / assetReturns.length;
    const avgMarketReturn = marketReturns.reduce((a, b) => a + b) / marketReturns.length;
    
    const covariance = assetReturns.reduce((sum, ar, i) => 
      sum + (ar - avgAssetReturn) * (marketReturns[i] - avgMarketReturn), 0
    ) / (assetReturns.length - 1);
    
    const marketVariance = marketReturns.reduce((sq, n) => 
      sq + Math.pow(n - avgMarketReturn, 2), 0
    ) / (marketReturns.length - 1);
    
    return covariance / marketVariance;
  },

  alpha: (
    assetReturns: number[],
    marketReturns: number[],
    riskFreeRate: number = 0.02
  ): number => {
    const avgAssetReturn = assetReturns.reduce((a, b) => a + b) / assetReturns.length;
    const beta = calculateRiskMetrics.beta(assetReturns, marketReturns);
    const avgMarketReturn = marketReturns.reduce((a, b) => a + b) / marketReturns.length;
    
    return avgAssetReturn - (riskFreeRate + beta * (avgMarketReturn - riskFreeRate));
  },

  correlationMatrix: (assets: { symbol: string; returns: number[] }[]): number[][] => {
    return assets.map((asset1, i) =>
      assets.map((asset2, j) => {
        if (i === j) return 1;
        return calculateCorrelation(asset1.returns, asset2.returns);
      })
    );
  },

  monteCarloSimulation: (
    initialValue: number,
    expectedReturn: number,
    volatility: number,
    days: number,
    simulations: number
  ): number[][] => {
    const results: number[][] = [];
    
    for (let sim = 0; sim < simulations; sim++) {
      const prices: number[] = [initialValue];
      for (let day = 1; day < days; day++) {
        const dailyReturn = generateRandomReturn(expectedReturn, volatility);
        prices.push(prices[day - 1] * (1 + dailyReturn));
      }
      results.push(prices);
    }
    
    return results;
  },

  valueAtRisk: (returns: number[], confidence: number = 0.95): number => {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * returns.length);
    return -sortedReturns[index];
  },
};

function calculateCorrelation(array1: number[], array2: number[]): number {
  const mean1 = array1.reduce((a, b) => a + b) / array1.length;
  const mean2 = array2.reduce((a, b) => a + b) / array2.length;
  
  const variance1 = array1.reduce((sq, n) => sq + Math.pow(n - mean1, 2), 0);
  const variance2 = array2.reduce((sq, n) => sq + Math.pow(n - mean2, 2), 0);
  
  const covariance = array1.reduce((sum, n, i) => 
    sum + (n - mean1) * (array2[i] - mean2), 0
  );
  
  return covariance / Math.sqrt(variance1 * variance2);
}

function generateRandomReturn(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + stdDev * z;
}

export const portfolioAnalysis = {
  // Portfolio Optimization
  calculateOptimalWeights: (
    returns: number[][],
    targetReturn?: number
  ): number[] => {
    const numAssets = returns.length;
    const correlationMatrix = calculateRiskMetrics.correlationMatrix(
      returns.map((ret, i) => ({ symbol: i.toString(), returns: ret }))
    );
    
    // Implement Markowitz portfolio optimization
    // This is a simplified version - in practice you'd use a quadratic programming solver
    const weights = new Array(numAssets).fill(1 / numAssets);
    
    // If target return is specified, adjust weights to meet the target
    if (targetReturn !== undefined) {
      // Implementation of constrained optimization
      // This would typically use a solver library
    }
    
    return weights;
  },

  // Tax Loss Harvesting
  findHarvestingOpportunities: (
    holdings: Array<{
      symbol: string;
      quantity: number;
      purchasePrice: number;
      currentPrice: number;
      purchaseDate: Date;
    }>
  ) => {
    const opportunities = holdings.filter(holding => {
      const unrealizedLoss = (holding.currentPrice - holding.purchasePrice) * holding.quantity;
      const daysHeld = (new Date().getTime() - holding.purchaseDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // Consider wash sale rules (30 days) and minimum loss threshold
      return unrealizedLoss < -1000 && daysHeld > 30;
    });

    return opportunities.map(opportunity => ({
      ...opportunity,
      potentialTaxSaving: Math.abs((opportunity.currentPrice - opportunity.purchasePrice) * 
        opportunity.quantity * 0.20) // Assuming 20% tax rate
    }));
  },

  // Dividend Analysis
  analyzeDividends: (
    dividendHistory: Array<{
      symbol: string;
      amount: number;
      date: Date;
      price: number;
    }>
  ) => {
    const analysis = dividendHistory.reduce((acc, div) => {
      const year = div.date.getFullYear();
      if (!acc[year]) {
        acc[year] = {
          totalAmount: 0,
          dividendCount: 0,
          averageYield: 0,
        };
      }
      
      acc[year].totalAmount += div.amount;
      acc[year].dividendCount++;
      acc[year].averageYield += (div.amount / div.price);
      
      return acc;
    }, {} as Record<number, { totalAmount: number; dividendCount: number; averageYield: number; }>);

    // Calculate averages
    Object.keys(analysis).forEach(year => {
      analysis[parseInt(year)].averageYield /= analysis[parseInt(year)].dividendCount;
    });

    return analysis;
  },

  // Performance Attribution
  attributePerformance: (
    portfolioReturn: number,
    holdings: Array<{
      symbol: string;
      weight: number;
      return: number;
      sector: string;
    }>,
    benchmarkReturns: Record<string, number>
  ) => {
    const sectorAttribution = holdings.reduce((acc, holding) => {
      if (!acc[holding.sector]) {
        acc[holding.sector] = {
          weight: 0,
          return: 0,
          contribution: 0
        };
      }
      
      acc[holding.sector].weight += holding.weight;
      acc[holding.sector].return += holding.return * holding.weight;
      acc[holding.sector].contribution = acc[holding.sector].return - 
        (benchmarkReturns[holding.sector] || 0) * acc[holding.sector].weight;
      
      return acc;
    }, {} as Record<string, { weight: number; return: number; contribution: number; }>);

    return {
      totalReturn: portfolioReturn,
      sectorAttribution,
      totalAttribution: Object.values(sectorAttribution)
        .reduce((sum, sector) => sum + sector.contribution, 0)
    };
  },

  // Risk Decomposition
  decomposeRisk: (
    holdings: Array<{
      symbol: string;
      weight: number;
      volatility: number;
      correlations: number[];
    }>
  ) => {
    const portfolioRisk = Math.sqrt(
      holdings.reduce((total, h1, i) => 
        total + holdings.reduce((sum, h2, j) => 
          sum + h1.weight * h2.weight * h1.volatility * h2.volatility * h1.correlations[j]
        , 0)
      , 0)
    );

    const contributions = holdings.map(holding => {
      const marginalContribution = holdings.reduce((sum, h, j) => 
        sum + h.weight * holding.volatility * h.volatility * holding.correlations[j]
      , 0);
      
      return {
        symbol: holding.symbol,
        weight: holding.weight,
        riskContribution: (holding.weight * marginalContribution) / portfolioRisk,
        percentageContribution: (holding.weight * marginalContribution) / (portfolioRisk * portfolioRisk) * 100
      };
    });

    return {
      portfolioRisk,
      riskDecomposition: contributions
    };
  }
};
