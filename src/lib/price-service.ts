import { config } from './config';

interface PriceUpdate {
  symbol: string;
  price: number;
  priceChange24h: number;
}

interface Asset {
  symbol: string;
  type: 'crypto' | 'stock';
}

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

// Map of common crypto symbols to CoinGecko IDs
const CRYPTO_ID_MAP: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'USDT': 'tether',
  'BNB': 'binancecoin',
  'XRP': 'ripple',
  'SOL': 'solana',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'DOT': 'polkadot',
  'MATIC': 'matic-network',
  'SHIB': 'shiba-inu',
  'TRX': 'tron',
  'DAI': 'dai',
  'UNI': 'uniswap',
  'WBTC': 'wrapped-bitcoin',
  'LTC': 'litecoin',
  'LINK': 'chainlink',
  'ATOM': 'cosmos',
  'XLM': 'stellar',
  'BCH': 'bitcoin-cash',
};

// Add rate limiting
let lastCryptoRequest = 0;
const RATE_LIMIT_DELAY = 1100; // 1.1 seconds between requests

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getCryptoPrice(symbol: string): Promise<{ price: number; priceChange24h: number }> {
  try {
    // Implement rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastCryptoRequest;
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      await delay(RATE_LIMIT_DELAY - timeSinceLastRequest);
    }
    lastCryptoRequest = Date.now();

    const coinId = CRYPTO_ID_MAP[symbol.toUpperCase()] || symbol.toLowerCase();
    console.log(`Fetching crypto price for ${symbol} (${coinId}) using CoinGecko API...`);

    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FinTrack Portfolio Tracker'
        }
      }
    );

    // Handle rate limiting response
    if (response.status === 429) {
      console.log('Rate limit hit, waiting before retry...');
      await delay(5000); // Wait 5 seconds before retry
      return getCryptoPrice(symbol);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CoinGecko API error for ${symbol}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      // Return last known price or default values instead of throwing
      return {
        price: 0,
        priceChange24h: 0
      };
    }

    const data = await response.json();
    console.log(`Received data for ${symbol}:`, data);

    if (!data[coinId] || !data[coinId].usd) {
      console.error(`No price data found for ${symbol} (${coinId}):`, data);
      return {
        price: 0,
        priceChange24h: 0
      };
    }

    return {
      price: data[coinId].usd,
      priceChange24h: data[coinId].usd_24h_change || 0
    };
  } catch (error) {
    console.error(`Error fetching crypto price for ${symbol}:`, error);
    // Return default values instead of throwing
    return {
      price: 0,
      priceChange24h: 0
    };
  }
}

async function getStockPrice(symbol: string): Promise<{ price: number; priceChange24h: number }> {
  try {
    console.log(`Fetching stock price for ${symbol} using Finnhub API...`);
    const response = await fetch(
      `${config.finnhub.baseUrl}/quote?symbol=${symbol.toUpperCase()}`,
      {
        headers: {
          'X-Finnhub-Token': config.finnhub.apiKey
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Finnhub API error for ${symbol}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to fetch stock price: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Received data for ${symbol}:`, data);

    if (!data.c || data.c === 0) {
      console.error(`No price data found for ${symbol}:`, data);
      throw new Error(`No data found for stock symbol: ${symbol}`);
    }

    const priceChange24h = ((data.c - data.pc) / data.pc) * 100;

    return {
      price: data.c,
      priceChange24h
    };
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    throw error;
  }
}

export async function getCurrentPrice(symbol: string, type: 'crypto' | 'stock'): Promise<number> {
  const priceData = type === 'crypto' 
    ? await getCryptoPrice(symbol)
    : await getStockPrice(symbol);
  return priceData.price;
}

export async function updateAssetPrices(assets: Asset[]): Promise<PriceUpdate[]> {
  try {
    console.log('Updating prices for assets:', assets);
    const pricePromises = assets.map(async (asset) => {
      try {
        const priceData = asset.type === 'crypto'
          ? await getCryptoPrice(asset.symbol)
          : await getStockPrice(asset.symbol);

        console.log(`Updated price for ${asset.symbol}:`, priceData);
        return {
          symbol: asset.symbol,
          price: priceData.price,
          priceChange24h: priceData.priceChange24h
        };
      } catch (error) {
        console.error(`Error updating price for ${asset.symbol}:`, error);
        return {
          symbol: asset.symbol,
          price: 0,
          priceChange24h: 0
        };
      }
    });

    const results = await Promise.all(pricePromises);
    console.log('Price update results:', results);
    return results;
  } catch (error) {
    console.error('Error updating asset prices:', error);
    return [];
  }
} 