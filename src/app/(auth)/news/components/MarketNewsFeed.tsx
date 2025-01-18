'use client';

import { useQuery } from '@tanstack/react-query';
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

interface MarketNewsFeedProps {
  category?: string;
  bookmarkedNews?: Set<number>;
  onBookmark?: (newsId: number) => void;
}

export function MarketNewsFeed({ 
  category = 'general',
  bookmarkedNews = new Set(),
  onBookmark
}: MarketNewsFeedProps) {
  const { data: news, isLoading, error } = useQuery({
    queryKey: ['market-news', category],
    queryFn: async () => {
      const response = await fetch(`/api/news/market?category=${category}`);
      if (!response.ok) {
        throw new Error('Failed to fetch market news');
      }
      const data = await response.json();
      return data.articles;
    }
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
          <div className="text-red-500 text-center p-4">Failed to load market news</div>
        </FlatCardContent>
      </FlatCard>
    );
  }

  if (!news || news.length === 0) {
    return (
      <FlatCard>
        <FlatCardContent>
          <p className="text-center text-muted-foreground">
            No market news found
          </p>
        </FlatCardContent>
      </FlatCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Latest Market News</h2>
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
                <div className="flex justify-between items-start">
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
                  <div className="flex items-center gap-2">
                    {onBookmark && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onBookmark(index)}
                      >
                        <Bookmark
                          className={`h-4 w-4 ${bookmarkedNews.has(index) ? 'fill-primary' : ''}`}
                        />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleShare(article)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground mt-1">{article.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">{article.category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(article.publishedAt), 'MMM d, yyyy')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {article.source}
                  </span>
                </div>
              </div>
            </div>
          </FlatCardContent>
        </FlatCard>
      ))}
    </div>
  );
} 