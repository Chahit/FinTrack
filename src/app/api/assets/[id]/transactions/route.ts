import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const transactionSchema = z.object({
  type: z.enum(['BUY', 'SELL']),
  quantity: z.number().positive(),
  price: z.number().positive(),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = transactionSchema.parse(body);

    // Verify asset ownership
    const asset = await prisma.asset.findFirst({
      where: {
        id: params.id,
        portfolio: {
          userId,
        },
      },
      include: {
        transactions: true,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Calculate new quantity after transaction
    const currentQuantity = asset.quantity;
    const newQuantity = validatedData.type === 'BUY'
      ? currentQuantity + validatedData.quantity
      : currentQuantity - validatedData.quantity;

    if (newQuantity < 0) {
      return NextResponse.json(
        { error: 'Insufficient quantity for sell transaction' },
        { status: 400 }
      );
    }

    // Create transaction and update asset quantity
    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          assetId: params.id,
          portfolioId: asset.portfolioId,
          type: validatedData.type,
          quantity: validatedData.quantity,
          price: validatedData.price,
          date: new Date(validatedData.date),
          notes: validatedData.notes,
        },
      }),
      prisma.asset.update({
        where: { id: params.id },
        data: { quantity: newQuantity },
      }),
    ]);

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Transaction creation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify asset ownership and get transactions
    const asset = await prisma.asset.findFirst({
      where: {
        id: params.id,
        portfolio: {
          userId,
        },
      },
      include: {
        transactions: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json(asset.transactions);
  } catch (error) {
    console.error('Transaction fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
} 