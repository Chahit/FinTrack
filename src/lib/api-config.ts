export const API_CONFIG = {
  ALPHA_VANTAGE: {
    BASE_URL: 'https://www.alphavantage.co/query',
    API_KEY: process.env.ALPHA_VANTAGE_API_KEY,
  },
  FINANCIAL_MODELING_PREP: {
    BASE_URL: 'https://financialmodelingprep.com/api/v3',
    API_KEY: process.env.FMP_API_KEY,
  },
  COINGECKO: {
    BASE_URL: 'https://api.coingecko.com/api/v3',
  },
  BINANCE: {
    BASE_URL: 'https://api.binance.com/api/v3',
  },
  YAHOO_FINANCE: {
    BASE_URL: 'https://yfapi.net',
    API_KEY: process.env.YAHOO_FINANCE_API_KEY,
  },
  WORLD_TRADING_DATA: {
    BASE_URL: 'https://api.worldtradingdata.com/api/v1',
    API_KEY: process.env.WORLD_TRADING_DATA_API_KEY,
  },
  NEWS: {
    BLOOMBERG: {
      BASE_URL: 'https://bloomberg-market-and-financial-news.p.rapidapi.com/news/list',
      API_KEY: process.env.BLOOMBERG_API_KEY,
    },
    REUTERS: {
      BASE_URL: 'https://reuters-business-and-financial-news.p.rapidapi.com/article-list',
      API_KEY: process.env.REUTERS_API_KEY,
    },
  },
};
