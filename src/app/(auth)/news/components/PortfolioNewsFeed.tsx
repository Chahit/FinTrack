'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { NewsService, NewsItem } from '@/lib/services/news.service';
import { format } from 'date-fns';
import { Bookmark, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { SkeletonCard } from '@/components/ui/skeleton-card';

interface PortfolioNewsFeedProps {
  portfolioSymbols: string[];
  onBookmark?: (newsId: number) => void;
  bookmarkedNews?: Set<number>;
}

export function PortfolioNewsFeed({ 
  portfolioSymbols,
  onBookmark,
  bookmarkedNews = new Set()
}: PortfolioNewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (portfolioSymbols.length === 0) {
      setNews([]);
      setLoading(false);
      return;
    }

    fetchPortfolioNews();
  }, [portfolioSymbols]);

  const fetchPortfolioNews = async () => {
    setLoading(true);
    const response = await NewsService.getPortfolioNews(portfolioSymbols);
    if (response.error) {
      setError(response.error);
    } else {
      setNews(response.data);
      setError(null);
    }
    setLoading(false);
  };

  const handleShare = async (newsItem: NewsItem) => {
    try {
      await navigator.share({
        title: newsItem.headline,
        text: newsItem.summary,
        url: newsItem.url
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
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
      <CardContainer>
        <CardBody>
          <CardItem>
            <div className="text-red-500 text-center p-4">{error}</div>
          </CardItem>
        </CardBody>
      </CardContainer>
    );
  }

  if (portfolioSymbols.length === 0) {
    return (
      <CardContainer>
        <CardBody>
          <CardItem>
            <p className="text-center text-muted-foreground">
              Add assets to your portfolio to see relevant news
            </p>
          </CardItem>
        </CardBody>
      </CardContainer>
    );
  }

  return (
    <div className="space-y-6">
      <CardContainer>
        <CardBody>
          <CardItem>
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
          </CardItem>
        </CardBody>
      </CardContainer>

      {news.length === 0 ? (
        <CardContainer>
          <CardBody>
            <CardItem>
              <p className="text-center text-muted-foreground">
                No recent news found for your portfolio assets: {portfolioSymbols.join(', ')}
              </p>
            </CardItem>
          </CardBody>
        </CardContainer>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Latest Portfolio News</h2>
            <span className="text-sm text-muted-foreground">
              {news.length} articles found
            </span>
          </div>

          {news.map((item) => (
            <CardContainer key={item.id}>
              <CardBody>
                <CardItem>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold hover:text-primary">
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2"
                        >
                          {item.headline}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Badge variant="secondary">{item.related}</Badge>
                        <span>•</span>
                        <span>{item.source}</span>
                        <span>•</span>
                        <span>{format(new Date(item.datetime * 1000), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {onBookmark && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onBookmark(item.id)}
                        >
                          <Bookmark
                            className={`h-4 w-4 ${bookmarkedNews.has(item.id) ? 'fill-primary' : ''}`}
                          />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(item)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{item.summary}</p>
                </CardItem>
              </CardBody>
            </CardContainer>
          ))}
        </>
      )}
    </div>
  );
} 