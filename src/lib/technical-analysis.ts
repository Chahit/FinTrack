export const technicalIndicators = {
  SMA: (data: number[], period: number): number[] => {
    const sma: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  },

  EMA: (data: number[], period: number): number[] => {
    const ema: number[] = [data[0]];
    const multiplier = 2 / (period + 1);
    
    for (let i = 1; i < data.length; i++) {
      ema.push(
        (data[i] - ema[i - 1]) * multiplier + ema[i - 1]
      );
    }
    return ema;
  },

  RSI: (data: number[], period: number = 14): number[] => {
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    // Calculate price changes
    for (let i = 1; i < data.length; i++) {
      const change = data[i] - data[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }
    
    // Calculate initial averages
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;
    
    // Calculate RSI
    for (let i = period; i < data.length; i++) {
      avgGain = ((avgGain * (period - 1)) + gains[i - 1]) / period;
      avgLoss = ((avgLoss * (period - 1)) + losses[i - 1]) / period;
      
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
    
    return rsi;
  },

  MACD: (data: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) => {
    const fastEMA = technicalIndicators.EMA(data, fastPeriod);
    const slowEMA = technicalIndicators.EMA(data, slowPeriod);
    
    const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
    const signalLine = technicalIndicators.EMA(macdLine, signalPeriod);
    const histogram = macdLine.map((macd, i) => macd - signalLine[i]);
    
    return {
      macdLine,
      signalLine,
      histogram
    };
  },

  BollingerBands: (data: number[], period: number = 20, stdDev: number = 2) => {
    const sma = technicalIndicators.SMA(data, period);
    const bands = sma.map((middle, i) => {
      const slice = data.slice(i - period + 1, i + 1);
      const std = calculateStandardDeviation(slice);
      return {
        upper: middle + (stdDev * std),
        middle,
        lower: middle - (stdDev * std)
      };
    });
    return bands;
  },

  Stochastic: (high: number[], low: number[], close: number[], period: number = 14, smoothK: number = 3, smoothD: number = 3) => {
    const K: number[] = [];
    
    for (let i = period - 1; i < close.length; i++) {
      const currentClose = close[i];
      const highestHigh = Math.max(...high.slice(i - period + 1, i + 1));
      const lowestLow = Math.min(...low.slice(i - period + 1, i + 1));
      
      K.push(((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100);
    }
    
    const smoothedK = technicalIndicators.SMA(K, smoothK);
    const D = technicalIndicators.SMA(smoothedK, smoothD);
    
    return {
      K: smoothedK,
      D
    };
  }
};

function calculateStandardDeviation(data: number[]): number {
  const mean = data.reduce((a, b) => a + b) / data.length;
  const squareDiffs = data.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}
