import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { Prisma } from '.prisma/client';

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

    // Get all groups the user is a member of
    const groups = await prisma.chatGroup.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        _count: {
          select: {
            members: true
          }
        }
      }
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

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

    const { name } = await req.json();
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    // Create a unique invite code
    const inviteCode = nanoid(10);

    // Create the group and add the creator as a member in a transaction
    const group = await prisma.$transaction(async () => {
      // Create the group
      const newGroup = await prisma.chatGroup.create({
        data: {
          name: name.trim(),
          inviteCode,
          createdBy: userId,
          members: {
            create: {
              userId,
            },
          },
        },
      });

      return newGroup;
    });

    // Return the complete group data
    const completeGroup = await prisma.chatGroup.findUnique({
      where: { id: group.id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(completeGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    
    // Check for specific database errors with proper type checking
    if (
      error instanceof Error &&
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'A group with this name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
} 