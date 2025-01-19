import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// Use Node.js runtime for Prisma compatibility
export const runtime = 'nodejs';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user exists in our database
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        portfolio: {
          include: {
            assets: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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