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
  // Add more mappings as needed
};

async function getCryptoPrice(symbol: string): Promise<{ price: number; priceChange24h: number }> {
  try {
    const coinId = CRYPTO_ID_MAP[symbol.toUpperCase()] || symbol.toLowerCase();
    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch crypto price');
    }

    const data = await response.json();
    if (!data[coinId]) {
      throw new Error(`No data found for crypto symbol: ${symbol}`);
    }

    return {
      price: data[coinId].usd,
      priceChange24h: data[coinId].usd_24h_change || 0
    };
  } catch (error) {
    console.error(`Error fetching crypto price for ${symbol}:`, error);
    throw error;
  }
}

async function getStockPrice(symbol: string): Promise<{ price: number; priceChange24h: number }> {
  try {
    const response = await fetch(
      `${config.finnhub.baseUrl}/quote?symbol=${symbol.toUpperCase()}`,
      {
        headers: {
          'X-Finnhub-Token': config.finnhub.apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch stock price');
    }

    const data = await response.json();
    if (!data.c || data.c === 0) {
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
    const pricePromises = assets.map(async (asset) => {
      try {
        const priceData = asset.type === 'crypto'
          ? await getCryptoPrice(asset.symbol)
          : await getStockPrice(asset.symbol);

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

    return await Promise.all(pricePromises);
  } catch (error) {
    console.error('Error updating asset prices:', error);
    return [];
  }
} 