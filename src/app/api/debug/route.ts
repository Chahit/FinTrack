import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user exists in our database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        portfolio: {
          include: {
            assets: true
          }
        }
      }
    });

    if (!user) {
      // Create user and portfolio if they don't exist
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          email: 'user@example.com', // You should get this from Clerk
          portfolio: {
            create: {} // This will create an empty portfolio
          }
        },
        include: {
          portfolio: true
        }
      });

      return NextResponse.json({
        status: 'Created new user and portfolio',
        user: newUser
      });
    }

    return NextResponse.json({
      status: 'Found existing user',
      user,
      hasPortfolio: !!user.portfolio,
      assetCount: user.portfolio?.assets.length ?? 0
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      status: 'Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 