interface OHLCV {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
}

export const technicalIndicators = {
  // Moving Averages
  SMA: (prices: number[], period: number): number[] => {
    const sma: number[] = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  },

  EMA: (prices: number[], period: number): number[] => {
    const ema: number[] = [prices[0]];
    const multiplier = 2 / (period + 1);
    
    for (let i = 1; i < prices.length; i++) {
      ema.push(
        (prices[i] - ema[i - 1]) * multiplier + ema[i - 1]
      );
    }
    return ema;
  },

  // Relative Strength Index
  RSI: (prices: number[], period: number = 14): number[] => {
    const gains: number[] = [];
    const losses: number[] = [];
    const rsi: number[] = [];

    // Calculate price changes
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(Math.max(0, change));
      losses.push(Math.max(0, -change));
    }

    // Calculate initial averages
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;

    // Calculate RSI for each period
    for (let i = period; i < prices.length; i++) {
      avgGain = ((avgGain * (period - 1)) + gains[i - 1]) / period;
      avgLoss = ((avgLoss * (period - 1)) + losses[i - 1]) / period;

      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }

    return rsi;
  },

  // Moving Average Convergence Divergence
  MACD: (prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) => {
    const fastEMA = technicalIndicators.EMA(prices, fastPeriod);
    const slowEMA = technicalIndicators.EMA(prices, slowPeriod);
    const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
    const signalLine = technicalIndicators.EMA(macdLine, signalPeriod);
    const histogram = macdLine.map((macd, i) => macd - signalLine[i]);

    return {
      macdLine,
      signalLine,
      histogram
    };
  },

  // Bollinger Bands
  BollingerBands: (prices: number[], period: number = 20, stdDev: number = 2) => {
    const sma = technicalIndicators.SMA(prices, period);
    const bands = sma.map((middle, i) => {
      const slice = prices.slice(i - period + 1, i + 1);
      const std = Math.sqrt(
        slice.reduce((sum, price) => sum + Math.pow(price - middle, 2), 0) / period
      );
      return {
        upper: middle + (stdDev * std),
        middle,
        lower: middle - (stdDev * std)
      };
    });
    return bands;
  },

  // Volume Weighted Average Price
  VWAP: (data: OHLCV[]): number[] => {
    let cumulativeTPV = 0;
    let cumulativeVolume = 0;
    
    return data.map(candle => {
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      const TPV = typicalPrice * candle.volume;
      
      cumulativeTPV += TPV;
      cumulativeVolume += candle.volume;
      
      return cumulativeTPV / cumulativeVolume;
    });
  },

  // Average True Range
  ATR: (data: OHLCV[], period: number = 14): number[] => {
    const trueRanges: number[] = [];
    const atr: number[] = [];

    // Calculate True Range
    for (let i = 1; i < data.length; i++) {
      const tr = Math.max(
        data[i].high - data[i].low,
        Math.abs(data[i].high - data[i - 1].close),
        Math.abs(data[i].low - data[i - 1].close)
      );
      trueRanges.push(tr);
    }

    // Calculate ATR
    let atrValue = trueRanges.slice(0, period).reduce((a, b) => a + b) / period;
    atr.push(atrValue);

    for (let i = period; i < data.length - 1; i++) {
      atrValue = ((atrValue * (period - 1)) + trueRanges[i]) / period;
      atr.push(atrValue);
    }

    return atr;
  },

  // Fibonacci Retracement Levels
  FibonacciLevels: (high: number, low: number) => {
    const diff = high - low;
    return {
      level0: high,
      level236: high - (diff * 0.236),
      level382: high - (diff * 0.382),
      level500: high - (diff * 0.5),
      level618: high - (diff * 0.618),
      level100: low
    };
  },

  // On-Balance Volume
  OBV: (data: OHLCV[]): number[] => {
    const obv: number[] = [0];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i].close > data[i - 1].close) {
        obv.push(obv[i - 1] + data[i].volume);
      } else if (data[i].close < data[i - 1].close) {
        obv.push(obv[i - 1] - data[i].volume);
      } else {
        obv.push(obv[i - 1]);
      }
    }
    
    return obv;
  },

  // Stochastic Oscillator
  Stochastic: (data: OHLCV[], period: number = 14, smoothK: number = 3, smoothD: number = 3) => {
    const stochK: number[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const periodData = data.slice(i - period + 1, i + 1);
      const highestHigh = Math.max(...periodData.map(d => d.high));
      const lowestLow = Math.min(...periodData.map(d => d.low));
      
      stochK.push(
        ((data[i].close - lowestLow) / (highestHigh - lowestLow)) * 100
      );
    }
    
    const stochD = technicalIndicators.SMA(stochK, smoothD);
    
    return {
      k: technicalIndicators.SMA(stochK, smoothK),
      d: stochD
    };
  }
};
