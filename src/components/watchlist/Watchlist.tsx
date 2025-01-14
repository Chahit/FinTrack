"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface WatchlistItem {
  symbol: string;
  price: number;
  change: number;
  alerts: {
    price: number;
    condition: 'above' | 'below';
  }[];
}

export function Watchlist() {
  const { user } = useUser();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [newSymbol, setNewSymbol] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time price updates
    const interval = setInterval(() => {
      setWatchlist(current => 
        current.map(item => ({
          ...item,
          price: item.price * (1 + (Math.random() - 0.5) * 0.02),
          change: (Math.random() - 0.5) * 4
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Load watchlist from API
    const loadWatchlist = async () => {
      try {
        const response = await fetch('/api/watchlist');
        const data = await response.json();
        setWatchlist(data);
      } catch (error) {
        toast.error('Failed to load watchlist');
      } finally {
        setLoading(false);
      }
    };

    loadWatchlist();
  }, []);

  const addToWatchlist = async () => {
    if (!newSymbol) return;

    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: newSymbol.toUpperCase() })
      });

      if (!response.ok) throw new Error('Failed to add to watchlist');

      const data = await response.json();
      setWatchlist(current => [...current, data]);
      setNewSymbol('');
      toast.success('Added to watchlist');
    } catch (error) {
      toast.error('Failed to add to watchlist');
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    try {
      await fetch('/api/watchlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });

      setWatchlist(current => current.filter(item => item.symbol !== symbol));
      toast.success('Removed from watchlist');
    } catch (error) {
      toast.error('Failed to remove from watchlist');
    }
  };

  const addAlert = async (symbol: string, price: number, condition: 'above' | 'below') => {
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, price, condition })
      });

      setWatchlist(current =>
        current.map(item =>
          item.symbol === symbol
            ? { ...item, alerts: [...item.alerts, { price, condition }] }
            : item
        )
      );
      toast.success('Alert added');
    } catch (error) {
      toast.error('Failed to add alert');
    }
  };

  if (loading) {
    return (
      <div className="glass p-6 rounded-xl animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-6 rounded-xl">
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          placeholder="Add symbol (e.g., AAPL)"
          className="flex-1 bg-background/50 border border-border rounded-lg px-4 py-2"
        />
        <button
          onClick={addToWatchlist}
          className="btn-primary"
        >
          Add
        </button>
      </div>

      <AnimatePresence>
        {watchlist.map((item) => (
          <motion.div
            key={item.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="bg-background/50 rounded-lg p-4 mb-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{item.symbol}</h3>
                <p className={`text-sm ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">${item.price.toFixed(2)}</p>
                <button
                  onClick={() => removeFromWatchlist(item.symbol)}
                  className="text-red-500 text-sm hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => addAlert(item.symbol, item.price, 'above')}
                className="text-sm btn-secondary"
              >
                Alert Above
              </button>
              <button
                onClick={() => addAlert(item.symbol, item.price, 'below')}
                className="text-sm btn-secondary"
              >
                Alert Below
              </button>
            </div>

            {item.alerts.length > 0 && (
              <div className="mt-2 text-sm text-gray-400">
                Alerts: {item.alerts.map((alert, i) => (
                  <span key={i}>
                    {alert.condition} ${alert.price.toFixed(2)}
                    {i < item.alerts.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
