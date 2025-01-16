import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const FMP_API_KEY = process.env.FMP_API_KEY;

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

export async function getMarketData(symbol: string): Promise<MarketData> {
  try {
    // Alpha Vantage API for real-time quote
    const quoteResponse = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    const quote = quoteResponse.data['Global Quote'];
    
    // Financial Modeling Prep API for additional data
    const companyResponse = await axios.get(
      `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`
    );

    const company = companyResponse.data[0];

    return {
      symbol,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      volume: parseInt(quote['06. volume']),
      marketCap: company.mktCap,
      peRatio: company.pe,
      dividend: company.lastDiv,
      high52Week: company['52WeekHigh'],
      low52Week: company['52WeekLow']
    };
  } catch (error) {
    console.error(`Error fetching market data for ${symbol}:`, error);
    throw error;
  }
}

export async function getHistoricalData(symbol: string, days: number = 365) {
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    const timeSeries = response.data['Time Series (Daily)'];
    const data = Object.entries(timeSeries)
      .slice(0, days)
      .map(([date, values]: [string, any]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'])
      }));

    return data;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    throw error;
  }
}

export async function getCompanyNews(symbol: string) {
  try {
    const response = await axios.get(
      `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=50&apikey=${FMP_API_KEY}`
    );

    return response.data.map((news: any) => ({
      title: news.title,
      content: news.text,
      url: news.url,
      source: news.site,
      symbols: [symbol],
      sentiment: null, // You can add sentiment analysis here
      createdAt: new Date(news.publishedDate)
    }));
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    throw error;
  }
}
