import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const assetUpdateSchema = z.object({
  quantity: z.number().positive().optional(),
  purchasePrice: z.number().positive().optional(),
  purchaseDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = assetUpdateSchema.parse(body);

    // Verify asset ownership
    const asset = await prisma.asset.findFirst({
      where: {
        id: params.id,
        portfolio: {
          userId,
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Update asset
    const updatedAsset = await prisma.asset.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        transactions: true,
      },
    });

    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error('Asset update error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update asset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify asset ownership
    const asset = await prisma.asset.findFirst({
      where: {
        id: params.id,
        portfolio: {
          userId,
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Delete asset and related transactions
    await prisma.$transaction([
      prisma.transaction.deleteMany({
        where: { assetId: params.id },
      }),
      prisma.asset.delete({
        where: { id: params.id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Asset deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
} 