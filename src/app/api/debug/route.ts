import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateServerSession } from '@/lib/server/auth';

// Use Node.js runtime for Prisma compatibility
export const runtime = 'nodejs';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await validateServerSession();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists in our database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        portfolio: {
          include: {
            assets: true
          }
        }
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: 'Found existing user',
      user: dbUser,
      hasPortfolio: !!dbUser.portfolio,
      assetCount: dbUser.portfolio?.assets.length ?? 0
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      status: 'Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 