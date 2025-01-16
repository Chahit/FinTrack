import { auth } from '@clerk/nextjs';

export interface UserSettings {
  theme: 'light' | 'dark';
  currency: string;
  timeZone: string;
  notifications: {
    priceAlerts: boolean;
    newsDigest: boolean;
    portfolioUpdates: boolean;
    securityAlerts: boolean;
  };
  portfolio: {
    autoRefresh: boolean;
    showDistribution: boolean;
  };
}

export class SettingsService {
  static async getUserSettings(): Promise<UserSettings> {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching user settings:', error);
      // Return default settings if fetch fails
      return {
        theme: 'light',
        currency: 'USD',
        timeZone: 'UTC',
        notifications: {
          priceAlerts: true,
          newsDigest: true,
          portfolioUpdates: true,
          securityAlerts: true,
        },
        portfolio: {
          autoRefresh: true,
          showDistribution: true,
        },
      };
    }
  }

  static async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      return response.json();
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  static async updateNotifications(notifications: Partial<UserSettings['notifications']>): Promise<void> {
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notifications }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notification settings');
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
      throw error;
    }
  }

  static async updatePortfolioSettings(portfolioSettings: Partial<UserSettings['portfolio']>): Promise<void> {
    try {
      const response = await fetch('/api/settings/portfolio', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ portfolio: portfolioSettings }),
      });

      if (!response.ok) {
        throw new Error('Failed to update portfolio settings');
      }
    } catch (error) {
      console.error('Error updating portfolio settings:', error);
      throw error;
    }
  }
} 