import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from '@/config';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Asset {
  id: string;
  symbol: string;
  type: string;
  amount: number;
  currentPrice: number;
  priceChange24h: number;
}

interface PortfolioData {
  assets: Asset[];
  totalValue: number;
  dailyChange: number;
}

export class GeminiService {
  private static messages: Message[] = [];
  private static isProcessing: boolean = false;
  private static model = genAI.getGenerativeModel({ model: "gemini-pro" });

  private static readonly SYSTEM_PROMPT = `You are an AI financial advisor assistant integrated into FinTrack, a personal finance and investment tracking application. You have access to real-time portfolio data and can provide personalized insights.

Your role is to:
1. Provide personalized financial insights based on the user's portfolio
2. Analyze portfolio performance and suggest optimizations
3. Offer educational insights about financial concepts
4. Help users make informed investment decisions
5. Answer questions about the user's assets and market trends

Keep responses concise, professional, and data-driven.

If a user asks about their portfolio but no data is available, kindly inform them that they need to add assets to their portfolio first.`;

  private static async getPortfolioData(): Promise<any> {
    try {
      const response = await fetch('/api/portfolio/assets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to view your portfolio.');
        }
        throw new Error('Failed to fetch portfolio data');
      }

      const data = await response.json();
      
      // Check if portfolio is empty
      if (!data.assets || data.assets.length === 0) {
        return null;
      }

      return {
        assets: data.assets,
        summary: {
          totalValue: data.summary.totalValue || 0,
          dayChange: data.summary.dayChange || 0,
          totalGainLoss: data.summary.totalGainLoss || 0,
          totalAssets: data.assets.length
        }
      };
    } catch (error) {
      console.error('Failed to fetch portfolio data:', error);
      return null;
    }
  }

  private static formatPortfolioContext(data: any): string {
    if (!data || !data.assets || data.assets.length === 0) {
      return "No assets found in your portfolio. Please add some assets to get personalized insights.";
    }

    const { assets, summary } = data;

    return `
Current Portfolio Status:
- Total Portfolio Value: $${summary.totalValue.toLocaleString()}
- Daily Change: ${summary.dayChange >= 0 ? '+' : ''}${summary.dayChange.toFixed(2)}%
- Total Profit/Loss: ${summary.totalGainLoss >= 0 ? '+' : ''}$${summary.totalGainLoss.toLocaleString()}
- Number of Assets: ${summary.totalAssets}

Your Assets:
${assets.map((asset: any) => 
  `- ${asset.symbol} (${asset.type}): ${asset.quantity} units at $${asset.metrics?.currentPrice?.toFixed(2) || '0'} (24h change: ${asset.metrics?.priceChange24h >= 0 ? '+' : ''}${asset.metrics?.priceChange24h?.toFixed(2) || '0'}%)`
).join('\n')}

Asset Allocation:
${assets.map((asset: any) => {
  const percentage = (asset.metrics?.currentValue / summary.totalValue * 100) || 0;
  return `- ${asset.symbol}: ${percentage.toFixed(2)}%`;
}).join('\n')}
`;
  }

  static async sendMessage(message: string): Promise<string> {
    try {
      if (this.isProcessing) {
        return "Please wait for the previous message to complete.";
      }

      this.isProcessing = true;

      // Start a new chat
      const chat = this.model.startChat({
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.7,
        },
      });

      // Send system prompt first
      await chat.sendMessage(this.SYSTEM_PROMPT);

      // Add user message to history
      this.messages.push({ role: 'user', content: message });

      // Check if the message is portfolio-related
      const isPortfolioQuery = message.toLowerCase().includes('portfolio') ||
        message.toLowerCase().includes('assets') ||
        message.toLowerCase().includes('holdings') ||
        message.toLowerCase().includes('investments');

      let fullMessage = message;
      
      if (isPortfolioQuery) {
        // Fetch portfolio data only for portfolio-related queries
        const portfolioData = await this.getPortfolioData();
        fullMessage = `${message}\n\n${this.formatPortfolioContext(portfolioData)}`;
      }

      // Get response
      const result = await chat.sendMessage(fullMessage);
      const responseText = result.response.text();

      // Add assistant response to history
      this.messages.push({ role: 'assistant', content: responseText });

      return responseText;
    } catch (error: any) {
      console.error('Chat Error:', error);
      if (error.message.includes('sign in')) {
        return "Please sign in to access your portfolio information.";
      }
      return "I apologize, but I encountered an error. Please try again in a moment.";
    } finally {
      this.isProcessing = false;
    }
  }

  static getMessageHistory(): Message[] {
    return this.messages;
  }

  static clearHistory(): void {
    this.messages = [];
  }
} 