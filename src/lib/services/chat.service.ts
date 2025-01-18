'use client';

export interface ChatMessage {
  id: string;
  content: string;
  username: string;
  groupId?: string;
  createdAt: Date;
}

export interface ChatGroup {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  createdAt: Date;
  members: string[];
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
  static async sendMessage(message: string, groupId?: string): Promise<ChatMessage> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          groupId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const data = await response.json();
      return {
        ...data,
        createdAt: new Date(data.createdAt),
      };
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  static async getMessages(groupId?: string, lastMessageId?: string): Promise<ChatMessage[]> {
    try {
      const params = new URLSearchParams();
      if (groupId) params.append('groupId', groupId);
      if (lastMessageId) params.append('lastMessageId', lastMessageId);

      const response = await fetch(`/api/chat?${params.toString()}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch messages');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  static async createGroup(name: string): Promise<ChatGroup> {
    try {
      const response = await fetch('/api/chat/group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create group');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  static async joinGroup(inviteCode: string): Promise<ChatGroup> {
    try {
      const response = await fetch('/api/chat/group/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join group');
      }

      return await response.json();
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  }

  static async getGroups(): Promise<ChatGroup[]> {
    try {
      const response = await fetch('/api/chat/group');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch groups');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }

  static async getPortfolioData(): Promise<PortfolioData | null> {
    try {
      const response = await fetch('/api/portfolio/analysis');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch portfolio data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      throw error;
    }
  }

  static async deleteGroup(groupId: string): Promise<void> {
    try {
      const response = await fetch(`/api/chat/group/${groupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete group');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }
} 