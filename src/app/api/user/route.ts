import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
if (!session?.user) {
  return new NextResponse('Unauthorized', { status: 401 });
}
const userId = session.user.id;
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        portfolio: true,
        groups: true,
        messages: true
      }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      portfolio: user.portfolio,
      groups: user.groups,
      messages: user.messages
    });
  } catch (error) {
    console.error('GET user error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
if (!session?.user) {
  return new NextResponse('Unauthorized', { status: 401 });
}
const userId = session.user.id;
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const updateSchema = z.object({
      email: z.string().email().optional(),
    });

    const body = await request.json();
    const validatedData = updateSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
      include: {
        portfolio: true,
        groups: true,
        messages: true
      }
    });

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      portfolio: updatedUser.portfolio,
      groups: updatedUser.groups,
      messages: updatedUser.messages
    });
  } catch (error) {
    console.error('PUT user error:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
if (!session?.user) {
  return new NextResponse('Unauthorized', { status: 401 });
}
const userId = session.user.id;
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE user error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}