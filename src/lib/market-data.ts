import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface ChartData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CompanyProfile {
  name: string;
  exchange: string;
  industry: string;
  marketCap: number;
  logo: string;
  weburl: string;
}

export const marketData = {
  async getQuote(symbol: string): Promise<MarketData> {
    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );
      
      const data = response.data;
      return {
        symbol,
        price: data.c,
        change: data.d,
        changePercent: data.dp,
        volume: data.v,
        high: data.h,
        low: data.l,
        open: data.o,
        previousClose: data.pc,
      };
    } catch (error) {
      console.error('Error fetching quote:', error);
      throw error;
    }
  },

  async getHistoricalData(
    symbol: string,
    interval: '1min' | '5min' | '15min' | '30min' | '60min' | '1D' | 'daily' = 'daily',
    outputsize: 'compact' | 'full' = 'compact'
  ): Promise<ChartData[]> {
    try {
      const function_name = interval === 'daily' || interval === '1D' ? 'TIME_SERIES_DAILY' : 'TIME_SERIES_INTRADAY';
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=${function_name}&symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      const timeSeriesKey = interval === 'daily' || interval === '1D' ? 'Time Series (Daily)' : `Time Series (${interval})`;
      const timeSeries = response.data[timeSeriesKey];
      
      return Object.entries(timeSeries).map(([timestamp, values]: [string, any]) => ({
        timestamp: new Date(timestamp).getTime(),
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'], 10),
      }));
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  },

  async getMarketNews(category: string = 'general'): Promise<any[]> {
    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/news?category=${category}&token=${FINNHUB_API_KEY}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching market news:', error);
      throw error;
    }
  },

  async getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );
      const data = response.data;
      return {
        name: data.name,
        exchange: data.exchange,
        industry: data.finnhubIndustry,
        marketCap: data.marketCapitalization,
        logo: data.logo,
        weburl: data.weburl,
      };
    } catch (error) {
      console.error('Error fetching company profile:', error);
      throw error;
    }
  },

  async getTechnicalAnalysis(symbol: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/scan/technical-indicator?symbol=${symbol}&resolution=D&token=${FINNHUB_API_KEY}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching technical analysis:', error);
      throw error;
    }
  }
};
