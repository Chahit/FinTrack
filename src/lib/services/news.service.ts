'use client';

export interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  category: string;
  related?: string;
}

interface NewsFilters {
  category?: string;
  sentiment?: string;
  search?: string;
}

interface NewsResponse {
  data: NewsItem[];
  error?: string;
}

export class NewsService {
  static async getMarketNews(filters: NewsFilters): Promise<NewsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.sentiment) queryParams.append('sentiment', filters.sentiment);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`/api/news/market?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch market news');
      }
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error fetching market news:', error);
      return { data: [], error: 'Failed to fetch market news. Please try again later.' };
    }
  }

  static async getPortfolioNews(symbols: string[]): Promise<NewsResponse> {
    try {
      if (!symbols.length) {
        return { data: [] };
      }

      const response = await fetch('/api/news/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbols }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio news');
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error fetching portfolio news:', error);
      return { data: [], error: 'Failed to fetch portfolio news. Please try again later.' };
    }
  }
} 