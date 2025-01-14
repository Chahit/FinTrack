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

    // Fetch gold price from metals-api alternative (free)
    const goldResponse = await fetch(
      'https://www.goldapi.io/api/XAU/USD',
      {
        headers: {
          'x-access-token': 'goldapi-free'
        }
      }
    );
    const goldData = await goldResponse.json();

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
      gold: {
        price: goldData.price,
        change: goldData.ch
      },
      fearAndGreed: {
        value: fearGreedData.data[0].value,
        status: fearGreedData.data[0].value_classification
      }
    };
  } catch (error) {
    console.error('Error fetching market data:', error);
    // Return fallback data in case of API failures
    return {
      bitcoin: {
        price: 0,
        change: 0
      },
      sp500: {
        price: 0,
        change: 0
      },
      gold: {
        price: 0,
        change: 0
      },
      fearAndGreed: {
        value: 0,
        status: 'Unknown'
      }
    };
  }
}

// Portfolio Data APIs (using local mock data for now)
export async function fetchPortfolioData(userId: string) {
  try {
    // In a real app, this would fetch from your backend
    // For now, we'll use mock data
    const mockData = {
      totalValue: 36195.739,
      previousValue: 34961.179,
      dailyChange: {
        percentage: 2.45,
        value: 567.89,
      },
      assets: {
        count: 4,
        bestPerformer: {
          symbol: 'BTC',
          change: 2.45,
        },
      },
    };
    
    return mockData;
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    throw error;
  }
}

// Market News API (using free NewsAPI)
export async function fetchMarketNews() {
  try {
    const response = await fetch(
      'https://newsapi.org/v2/everything?q=finance+market&language=en&sortBy=publishedAt&pageSize=10&apiKey=dummy'
    );
    const data = await response.json();

    // If API fails, return mock news data
    if (!response.ok) {
      return {
        articles: [
          {
            title: "Market Update: S&P 500 Reaches New Heights",
            description: "The S&P 500 continues its upward trend as tech stocks lead the rally.",
            url: "#",
            publishedAt: new Date().toISOString()
          },
          {
            title: "Bitcoin Surges Past Previous Resistance",
            description: "Cryptocurrency markets show strong momentum as Bitcoin breaks through key levels.",
            url: "#",
            publishedAt: new Date().toISOString()
          }
        ]
      };
    }

    return data;
  } catch (error) {
    console.error('Error fetching market news:', error);
    return {
      articles: [
        {
          title: "Market Update: S&P 500 Reaches New Heights",
          description: "The S&P 500 continues its upward trend as tech stocks lead the rally.",
          url: "#",
          publishedAt: new Date().toISOString()
        },
        {
          title: "Bitcoin Surges Past Previous Resistance",
          description: "Cryptocurrency markets show strong momentum as Bitcoin breaks through key levels.",
          url: "#",
          publishedAt: new Date().toISOString()
        }
      ]
    };
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
