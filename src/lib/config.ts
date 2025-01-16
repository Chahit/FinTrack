export const config = {
  finnhub: {
    apiKey: process.env.NEXT_PUBLIC_FINNHUB_API_KEY || '',
    baseUrl: 'https://finnhub.io/api/v1',
  },
  cryptocompare: {
    apiKey: process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY || '',
    baseUrl: 'https://min-api.cryptocompare.com/data/v2',
  },
  newsapi: {
    apiKey: process.env.NEXT_PUBLIC_NEWSAPI_KEY || '',
    baseUrl: 'https://newsapi.org/v2',
  },
  marketaux: {
    apiKey: process.env.NEXT_PUBLIC_MARKETAUX_API_KEY || '',
    baseUrl: 'https://api.marketaux.com/v1',
  }
};

// News categories we support
export const NEWS_CATEGORIES = [
  'general',
  'forex',
  'crypto',
  'merger',
  'economic',
  'technology'
] as const;

export type NewsCategory = typeof NEWS_CATEGORIES[number]; 