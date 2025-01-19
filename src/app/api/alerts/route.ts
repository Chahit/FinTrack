import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const alertSchema = z.object({
  assetId: z.string(),
  type: z.enum(['ABOVE', 'BELOW']),
  price: z.number().positive(),
  active: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
if (!session?.user) {
  return new NextResponse('Unauthorized', { status: 401 });
}
const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = alertSchema.parse(body);

    // Verify asset ownership
    const asset = await prisma.asset.findFirst({
      where: {
        id: validatedData.assetId,
        portfolio: {
          userId,
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Create alert
    const alert = await prisma.priceAlert.create({
      data: {
        assetId: validatedData.assetId,
        type: validatedData.type,
        price: validatedData.price,
        active: validatedData.active,
      },
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Alert creation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
if (!session?.user) {
  return new NextResponse('Unauthorized', { status: 401 });
}
const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active alerts for user's assets
    const alerts = await prisma.priceAlert.findMany({
      where: {
        active: true,
        asset: {
          portfolio: {
            userId,
          },
        },
      },
      include: {
        asset: true,
      },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Alert fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
} 