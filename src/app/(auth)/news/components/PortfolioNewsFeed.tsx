'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Bookmark, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlatCard, FlatCardHeader, FlatCardContent } from '@/components/ui/flat-card';
import { SkeletonCard } from '@/components/ui/skeleton-card';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedAt: string;
  category: string;
  source: string;
}

interface PortfolioNewsFeedProps {
  portfolioSymbols: string[];
  bookmarkedNews?: Set<number>;
}

export function PortfolioNewsFeed({ 
  portfolioSymbols,
  bookmarkedNews = new Set()
}: PortfolioNewsFeedProps) {
  const { data: news, isLoading, error } = useQuery({
    queryKey: ['portfolio-news', portfolioSymbols],
    queryFn: async () => {
      const response = await fetch('/api/news/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: portfolioSymbols })
      });
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio news');
      }
      const data = await response.json();
      return data.articles;
    },
    enabled: portfolioSymbols.length > 0
  });

  const handleShare = async (newsItem: NewsArticle) => {
    try {
      await navigator.share({
        title: newsItem.title,
        text: newsItem.description,
        url: newsItem.url
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} className="h-[200px]" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <FlatCard>
        <FlatCardContent>
          <div className="text-red-500 text-center p-4">Failed to load news</div>
        </FlatCardContent>
      </FlatCard>
    );
  }

  if (portfolioSymbols.length === 0) {
    return (
      <FlatCard>
        <FlatCardContent>
          <p className="text-center text-muted-foreground">
            Add assets to your portfolio to see relevant news
          </p>
        </FlatCardContent>
      </FlatCard>
    );
  }

  return (
    <div className="space-y-6">
      <FlatCard>
        <FlatCardContent>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Your Portfolio Assets</h3>
            <div className="flex flex-wrap gap-2">
              {portfolioSymbols.map((symbol) => (
                <Badge key={symbol} variant="secondary">
                  {symbol}
                </Badge>
              ))}
            </div>
          </div>
        </FlatCardContent>
      </FlatCard>

      {!news || news.length === 0 ? (
        <FlatCard>
          <FlatCardContent>
            <p className="text-center text-muted-foreground">
              No recent news found for your portfolio assets
            </p>
          </FlatCardContent>
        </FlatCard>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Latest Portfolio News</h2>
            <span className="text-sm text-muted-foreground">
              {news.length} articles found
            </span>
          </div>

          {news.map((article: NewsArticle, index: number) => (
            <FlatCard key={index}>
              <FlatCardContent>
                <div className="flex justify-between items-start gap-4">
                  {article.image && (
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold hover:text-primary">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2"
                      >
                        {article.title}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </h3>
                    <p className="text-muted-foreground mt-1">{article.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-muted-foreground">
                        {(() => {
                          try {
                            return format(new Date(article.publishedAt), 'MMM d, yyyy');
                          } catch (error) {
                            return 'Invalid date';
                          }
                        })()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {article.source}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleShare(article)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </FlatCardContent>
            </FlatCard>
          ))}
        </>
      )}
    </div>
  );
} 