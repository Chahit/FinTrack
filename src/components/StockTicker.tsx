import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Ticker from 'react-ticker';

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const STOCK_SYMBOLS = [
  // Major Tech
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA',
  // Financial
  'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS',
  // Healthcare
  'JNJ', 'UNH', 'PFE', 'ABBV',
  // Consumer
  'WMT', 'PG', 'KO', 'PEP', 'DIS',
  // Industrial
  'CAT', 'BA', 'HON',
  // Energy
  'XOM', 'CVX',
  // Telecom
  'VZ', 'T'
];

export function StockTicker() {
  const [stocks, setStocks] = useState<StockPrice[]>([]);
  const [direction, setDirection] = useState<'toLeft' | 'toRight'>('toLeft');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStockPrices() {
      try {
        const promises = STOCK_SYMBOLS.map(async (symbol) => {
          const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`);
          if (!response.ok) throw new Error('Failed to fetch stock price');
          const data = await response.json();
          return {
            symbol,
            price: data.c,
            change: data.d,
            changePercent: data.dp
          };
        });

        const stockData = await Promise.all(promises);
        setStocks(stockData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching stock prices:', error);
        setIsLoading(false);
      }
    }

    fetchStockPrices();
    const interval = setInterval(fetchStockPrices, 60000); // Update every minute

    // Change direction every 30 seconds
    const directionInterval = setInterval(() => {
      setDirection(prev => prev === 'toLeft' ? 'toRight' : 'toLeft');
    }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(directionInterval);
    };
  }, []);

  if (isLoading || stocks.length === 0) {
    return <div className="w-full bg-background border-b py-2">Loading stocks...</div>;
  }

  return (
    <div className="w-full bg-background border-b overflow-hidden">
      <Ticker direction={direction} mode="chain" move={true}>
        {() => (
          <div className="flex items-center">
            {stocks.map((stock, index) => (
              <div
                key={`${stock.symbol}-${index}`}
                className="inline-flex items-center mx-4"
              >
                <span className="font-semibold">{stock.symbol}</span>
                <span className="ml-2">${stock.price?.toFixed(2)}</span>
                <span
                  className={`ml-2 flex items-center ${
                    stock.change >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {stock.change >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {stock.changePercent?.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </Ticker>
    </div>
  );
} 