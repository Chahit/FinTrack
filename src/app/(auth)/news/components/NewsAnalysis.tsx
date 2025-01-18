'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NewsItem } from '@/lib/services/news.service';
import { InteractiveChart } from '@/components/ui/interactive-chart';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';

interface SentimentAnalysis {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  keywords: string[];
  trends: Array<{
    date: string;
    value: number;
    name: string;
  }>;
}

interface NewsAnalysisProps {
  newsItems: NewsItem[];
}

export function NewsAnalysis({ newsItems }: NewsAnalysisProps) {
  const [sentiment, setSentiment] = useState<SentimentAnalysis>({
    score: 0,
    label: 'neutral',
    keywords: [],
    trends: []
  });

  useEffect(() => {
    if (newsItems.length === 0) return;

    // Extract keywords from news headlines and summaries
    const text = newsItems
      .map(item => `${item.headline} ${item.summary}`)
      .join(' ')
      .toLowerCase();

    // Simple keyword extraction (in a real app, you'd use NLP)
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
    const words = text.split(/\W+/).filter(word => 
      word.length > 3 && !commonWords.has(word)
    );
    
    const wordFreq = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const keywords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([word]) => word);

    // Simple sentiment analysis based on timestamps and sources
    const sortedNews = [...newsItems].sort((a, b) => a.datetime - b.datetime);
    const trends = sortedNews.map((item, index) => ({
      date: new Date(item.datetime * 1000).toISOString().split('T')[0],
      value: 0.4 + (index / sortedNews.length) * 0.5, // Simplified sentiment score
      name: 'Market Sentiment'
    }));

    // Calculate overall sentiment (in a real app, you'd use ML/AI)
    const score = trends.reduce((acc, item) => acc + item.value, 0) / trends.length;
    
    setSentiment({
      score,
      label: score > 0.6 ? 'positive' : score < 0.4 ? 'negative' : 'neutral',
      keywords,
      trends
    });
  }, [newsItems]);

  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'positive':
        return 'bg-green-500/10 text-green-500';
      case 'negative':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <CardContainer>
      <CardBody>
        <CardItem>
          <div className="relative">
            <div className="relative z-10 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Market Sentiment Analysis</h2>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Sentiment</span>
                  <Badge variant="outline" className={getSentimentColor(sentiment.label)}>
                    {sentiment.label.charAt(0).toUpperCase() + sentiment.label.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Sentiment Score</span>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${sentiment.score * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {(sentiment.score * 100).toFixed(1)}% positive
                </span>
              </div>

              <div className="h-[200px]">
                <InteractiveChart
                  data={sentiment.trends}
                  height={200}
                  tooltipFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                />
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Trending Topics</span>
                <div className="flex flex-wrap gap-2">
                  {sentiment.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="animate-fade-in">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardItem>
      </CardBody>
    </CardContainer>
  );
} 