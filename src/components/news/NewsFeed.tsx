"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Clock } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  source: string;
  summary: string;
  url: string;
  timestamp: string;
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export function NewsFeed() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'stocks', 'crypto', 'forex', 'commodities'];

  useEffect(() => {
    // Simulated news data - replace with real API
    const mockNews: NewsArticle[] = [
      {
        id: '1',
        title: 'Federal Reserve Maintains Interest Rates',
        source: 'Financial Times',
        summary: 'The Federal Reserve decided to maintain current interest rates following their latest meeting...',
        url: '#',
        timestamp: new Date().toISOString(),
        category: 'stocks',
        sentiment: 'neutral'
      },
      {
        id: '2',
        title: 'Bitcoin Surges Past $50,000',
        source: 'CoinDesk',
        summary: 'Bitcoin has reached a new milestone, surpassing $50,000 for the first time since...',
        url: '#',
        timestamp: new Date().toISOString(),
        category: 'crypto',
        sentiment: 'positive'
      },
      // Add more mock news articles
    ];

    setNews(mockNews);
    setLoading(false);
  }, []);

  const filteredNews = news.filter(
    article => selectedCategory === 'all' || article.category === selectedCategory
  );

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.floor((date.getTime() - Date.now()) / (1000 * 60)),
      'minute'
    );
  };

  if (loading) {
    return (
      <div className="glass p-6 rounded-xl animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          Market News
        </h2>
        <div className="flex gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-background/50 text-gray-400 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredNews.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg transition-colors ${
              article.sentiment === 'positive'
                ? 'bg-green-500/10 hover:bg-green-500/20'
                : article.sentiment === 'negative'
                ? 'bg-red-500/10 hover:bg-red-500/20'
                : 'bg-background/50 hover:bg-background/70'
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-medium mb-2 hover:text-primary transition-colors">
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    {article.title}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </h3>
                <p className="text-sm text-gray-400 mb-2">{article.summary}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{article.source}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTimestamp(article.timestamp)}
                  </span>
                  <span className="capitalize">{article.category}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
