'use client';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface PortfolioData {
  totalValue: number;
  allocation: {
    stocks: number;
    bonds: number;
    cash: number;
  };
  performance: {
    ytdReturn: number;
    annualizedReturn: number;
  };
  assets: Array<{
    symbol: string;
    type: string;
    value: number;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    return: number;
  }>;
}

export class ChatService {
  static async sendMessage(message: string): Promise<string> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Chat error:', error);
      return 'Sorry, I encountered an error. Please try again later.';
    }
  }

  static async getPortfolioData(): Promise<PortfolioData | null> {
    try {
      const response = await fetch('/api/portfolio/analysis');
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      return null;
    }
  }
} 