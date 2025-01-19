import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const assetSchema = z.object({
  symbol: z.string().min(1),
  type: z.enum(['crypto', 'stock']),
  quantity: z.number().positive(),
  purchasePrice: z.number().positive(),
  purchaseDate: z.string().datetime(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Get user authentication
    const session = await getServerSession(authOptions);
if (!session?.user) {
  return new NextResponse('Unauthorized', { status: 401 });
}
const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const validatedData = assetSchema.parse(body);

    // Get or create user and portfolio in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get or create user
      const user = await tx.user.upsert({
        where: { id: userId },
        create: { 
          id: userId,
          email: 'user@example.com', // We'll update this later with Clerk webhooks
        },
        update: {},
      });

      // Get or create portfolio
      const portfolio = await tx.portfolio.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      });

      // Create the asset
      const asset = await tx.asset.create({
        data: {
          portfolioId: portfolio.id,
          symbol: validatedData.symbol,
          type: validatedData.type,
          quantity: validatedData.quantity,
          purchasePrice: validatedData.purchasePrice,
          purchaseDate: new Date(validatedData.purchaseDate),
          notes: validatedData.notes,
        },
      });

      return { portfolio, asset };
    });

    return NextResponse.json({ 
      success: true, 
      asset: result.asset,
      message: 'Asset created successfully' 
    });

  } catch (error) {
    console.error('Error in POST /api/assets/add:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to create asset',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 