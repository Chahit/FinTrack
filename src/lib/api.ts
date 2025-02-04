// Market Data APIs using free alternatives
export async function fetchMarketData() {
  try {
    // Fetch cryptocurrency data from CoinGecko (free, no API key needed)
    const cryptoResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24h_change=true'
    );
    const cryptoData = await cryptoResponse.json();

    // Fetch stock data from Yahoo Finance API (free)
    const spyResponse = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/SPY'
    );
    const spyData = await spyResponse.json();
    const spyPrice = spyData.chart.result[0].meta.regularMarketPrice;
    const spyPreviousClose = spyData.chart.result[0].meta.previousClose;
    const spyChange = ((spyPrice - spyPreviousClose) / spyPreviousClose) * 100;

    // Use alternative Fear & Greed Index API (free)
    const fearGreedResponse = await fetch(
      'https://api.alternative.me/fng/'
    );
    const fearGreedData = await fearGreedResponse.json();

    return {
      bitcoin: {
        price: cryptoData.bitcoin.usd,
        change: cryptoData.bitcoin.usd_24h_change
      },
      sp500: {
        price: spyPrice,
        change: spyChange
      },
      fearAndGreed: {
        value: fearGreedData.data[0].value,
        status: fearGreedData.data[0].value_classification
      }
    };
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
}

// Portfolio Data APIs
export async function fetchPortfolioData(userId: string) {
  try {
    const response = await fetch(`/api/portfolio/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio data');
    }
    
    const data = await response.json();
    return {
      totalValue: data.portfolio.totalValue,
      previousValue: data.portfolio.previousValue,
      dailyChange: {
        percentage: data.portfolio.dailyChangePercentage,
        value: data.portfolio.dailyChange,
      },
      assets: {
        count: data.portfolio.holdings.length,
        bestPerformer: data.portfolio.holdings.reduce((best: any, current: any) => {
          return (!best || current.gainLossPercentage > best.gainLossPercentage) ? current : best;
        }, null),
      },
    };
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    throw error;
  }
}

// Market News API (using NewsAPI)
export async function fetchMarketNews() {
  try {
    const response = await fetch('/api/market/news');
    if (!response.ok) {
      throw new Error('Failed to fetch market news');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching market news:', error);
    throw error;
  }
}

// Technical Analysis using Yahoo Finance API (free)
export async function fetchTechnicalAnalysis(symbol: string) {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=3mo`
    );
    const data = await response.json();
    
    const prices = data.chart.result[0].indicators.quote[0];
    const timestamps = data.chart.result[0].timestamp;
    
    // Calculate RSI
    const rsi = calculateRSI(prices.close, 14);
    
    // Calculate MACD
    const macd = calculateMACD(prices.close);
    
    return {
      rsi: rsi,
      macd: macd,
      volume: prices.volume,
      timestamps: timestamps
    };
  } catch (error) {
    console.error('Error fetching technical analysis:', error);
    throw error;
  }
}

// Helper function to calculate RSI
function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  let gains: number[] = [];
  let losses: number[] = [];

  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }

  // Calculate initial average gain and loss
  const avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
  const avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;

  let prevAvgGain = avgGain;
  let prevAvgLoss = avgLoss;

  // Calculate RSI for the first period
  rsi.push(100 - (100 / (1 + avgGain / avgLoss)));

  // Calculate RSI for remaining periods
  for (let i = period; i < prices.length - 1; i++) {
    const currentGain = gains[i];
    const currentLoss = losses[i];

    const avgGain = (prevAvgGain * (period - 1) + currentGain) / period;
    const avgLoss = (prevAvgLoss * (period - 1) + currentLoss) / period;

    prevAvgGain = avgGain;
    prevAvgLoss = avgLoss;

    rsi.push(100 - (100 / (1 + avgGain / avgLoss)));
  }

  return rsi;
}

// Helper function to calculate MACD
function calculateMACD(prices: number[]): { macd: number[], signal: number[], histogram: number[] } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  
  const macdLine = ema12.map((value, index) => value - ema26[index]);
  const signalLine = calculateEMA(macdLine, 9);
  const histogram = macdLine.map((value, index) => value - signalLine[index]);

  return {
    macd: macdLine,
    signal: signalLine,
    histogram: histogram
  };
}

// Helper function to calculate EMA
function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);

  // Start with SMA
  let sma = prices.slice(0, period).reduce((a, b) => a + b) / period;
  ema.push(sma);

  // Calculate EMA
  for (let i = period; i < prices.length; i++) {
    ema.push((prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]);
  }

  return ema;
}
