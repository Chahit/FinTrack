'use client';

import { Card, CardBody, CardHeader, Button, Input, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { TradingViewWidget } from "../trading/TradingViewWidget";
import { gsap } from "gsap";
import { PressEvent } from "@react-types/shared";

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  type: 'stock' | 'crypto' | 'commodity';
}

export function WatchlistComponent() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [newSymbol, setNewSymbol] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize watchlist data
  useEffect(() => {
    const mockWatchlist: WatchlistItem[] = [
      { symbol: 'AAPL', name: 'Apple Inc', price: 150.23, change24h: 2.5, type: 'stock' },
      { symbol: 'BTC', name: 'Bitcoin', price: 35000, change24h: -1.2, type: 'crypto' },
      { symbol: 'GOLD', name: 'Gold Futures', price: 1950.80, change24h: 0.5, type: 'commodity' }
    ];
    setWatchlist(mockWatchlist);
    setIsInitialized(true);
  }, []);

  // Handle animations after component is mounted and data is loaded
  useEffect(() => {
    if (!isInitialized) return;

    const ctx = gsap.context(() => {
      gsap.from(".watchlist-form", {
        opacity: 0,
        y: -20,
        duration: 0.5,
        ease: "power2.out"
      });

      gsap.from(".watchlist-item", {
        opacity: 0,
        x: -30,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.3
      });
    });

    return () => ctx.revert();
  }, [isInitialized]);

  const addToWatchlist = async () => {
    if (!newSymbol) return;

    const mockNewAsset: WatchlistItem = {
      symbol: newSymbol,
      name: `${newSymbol} Asset`,
      price: Math.random() * 1000,
      change24h: Math.random() * 10 - 5,
      type: 'stock'
    };

    const ctx = gsap.context(() => {
      gsap.from(".watchlist-item-new", {
        opacity: 0,
        x: -30,
        duration: 0.5,
        ease: "power2.out"
      });
    });

    setWatchlist([...watchlist, mockNewAsset]);
    setNewSymbol('');
    
    return () => ctx.revert();
  };

  const removeFromWatchlist = (symbol: string) => {
    const element = document.getElementById(`watchlist-item-${symbol}`);
    if (!element) return;

    const ctx = gsap.context(() => {
      gsap.to(`#watchlist-item-${symbol}`, {
        opacity: 0,
        x: 30,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setWatchlist(watchlist.filter(item => item.symbol !== symbol));
          if (selectedAsset === symbol) {
            setSelectedAsset(null);
          }
        }
      });
    });

    return () => ctx.revert();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-primary shadow-lg">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-primary dark:text-white">Watchlist</h2>
          <div className="flex gap-2 watchlist-form">
            <Input
              placeholder="Enter symbol (e.g., AAPL)"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              className="bg-gray-light dark:bg-gray-dark"
              aria-label="Enter stock symbol"
            />
            <Button 
              color="secondary"
              onPress={addToWatchlist}
              className="bg-secondary hover:bg-secondary/90 text-white"
              aria-label="Add to watchlist"
            >
              Add
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Watchlist table">
            <TableHeader>
              <TableColumn>Symbol</TableColumn>
              <TableColumn>Name</TableColumn>
              <TableColumn>Price</TableColumn>
              <TableColumn>24h Change</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {watchlist.map((item) => (
                <TableRow 
                  key={item.symbol}
                  id={`watchlist-item-${item.symbol}`}
                  className={`watchlist-item cursor-pointer ${
                    item === watchlist[watchlist.length - 1] ? 'watchlist-item-new' : ''
                  }`}
                  onClick={(e: React.MouseEvent) => {
                    if ((e.target as HTMLElement).closest('button')) return;
                    setSelectedAsset(item.symbol);
                  }}
                  aria-label={`${item.name} details`}
                >
                  <TableCell className="text-text-primary dark:text-white">{item.symbol}</TableCell>
                  <TableCell className="text-text-primary dark:text-white">{item.name}</TableCell>
                  <TableCell className="text-text-primary dark:text-white">${item.price.toFixed(2)}</TableCell>
                  <TableCell className={item.change24h >= 0 ? 'text-success' : 'text-accent'}>
                    {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                  </TableCell>
                  <TableCell>
                    <Button 
                      color="danger"
                      size="sm"
                      onPress={() => removeFromWatchlist(item.symbol)}
                      className="bg-accent hover:bg-accent/90 text-white"
                      aria-label={`Remove ${item.symbol} from watchlist`}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {selectedAsset && (
        <Card className="bg-white dark:bg-primary shadow-lg">
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary dark:text-white">
              Chart: {selectedAsset}
            </h3>
          </CardHeader>
          <CardBody>
            <TradingViewWidget 
              symbol={selectedAsset} 
              height={400}
              aria-label={`Trading chart for ${selectedAsset}`}
            />
          </CardBody>
        </Card>
      )}
    </div>
  );
}