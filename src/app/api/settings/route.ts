import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user settings from database
    const settings = await prisma.userSettings.findUnique({
      where: { userId }
    });

    // If no settings exist, return defaults
    if (!settings) {
      const defaultSettings = {
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

      // Create default settings for new user
      await prisma.userSettings.create({
        data: {
          userId,
          ...defaultSettings,
        },
      });

      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await req.json();

    // Update user settings
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        ...updates,
      },
      update: updates,
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
} 