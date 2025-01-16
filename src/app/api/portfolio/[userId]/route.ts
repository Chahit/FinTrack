import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: clerkUserId } = await getAuth(request);
    
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Ensure the requested userId matches the authenticated user
    if (clerkUserId !== params.userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: {
        user: {
          id: params.userId
        }
      },
      include: {
        assets: true,
      },
    });

    if (!portfolio) {
      return new NextResponse("Portfolio not found", { status: 404 });
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error("[PORTFOLIO_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: clerkUserId } = await getAuth(request);
    const body = await request.json();

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (clerkUserId !== params.userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedPortfolio = await prisma.portfolio.updateMany({
      where: {
        user: {
          id: params.userId
        }
      },
      data: body,
    });

    return NextResponse.json(updatedPortfolio);
  } catch (error) {
    console.error("[PORTFOLIO_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: clerkUserId } = await getAuth(request);

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (clerkUserId !== params.userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await prisma.portfolio.deleteMany({
      where: {
        user: {
          id: params.userId
        }
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PORTFOLIO_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
