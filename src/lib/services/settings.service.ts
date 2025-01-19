import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';

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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const settings = await prisma.userSettings.findUnique({
      where: {
        userId: session.user.id
      }
    });

    if (!settings) {
      // Return default settings if no settings found
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

    return settings;
  }

  static async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const updatedSettings = await prisma.userSettings.upsert({
      where: {
        userId: session.user.id
      },
      update: settings,
      create: {
        ...settings,
        userId: session.user.id
      }
    });

    return updatedSettings;
  }

  static async updateNotifications(notifications: Partial<UserSettings['notifications']>): Promise<void> {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const updatedSettings = await prisma.userSettings.upsert({
      where: {
        userId: session.user.id
      },
      update: { notifications },
      create: {
        notifications,
        userId: session.user.id
      }
    });
  }

  static async updatePortfolioSettings(portfolioSettings: Partial<UserSettings['portfolio']>): Promise<void> {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const updatedSettings = await prisma.userSettings.upsert({
      where: {
        userId: session.user.id
      },
      update: { portfolio: portfolioSettings },
      create: {
        portfolio: portfolioSettings,
        userId: session.user.id
      }
    });
  }
}