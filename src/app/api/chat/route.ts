import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const lastMessageId = searchParams.get('lastMessageId');

    // Build the query
    const query: any = {
      where: {
        groupId: groupId || null
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    };

    // Add condition for fetching messages after the last message
    if (lastMessageId) {
      const lastMessage = await prisma.chatMessage.findUnique({
        where: { id: lastMessageId }
      });

      if (lastMessage) {
        query.where.createdAt = {
          gt: lastMessage.createdAt
        };
      }
    }

    const messages = await prisma.chatMessage.findMany(query);

    // Transform messages to include only necessary info
    const transformedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      username: msg.username,
      groupId: msg.groupId,
      createdAt: msg.createdAt
    }));

    return NextResponse.json(transformedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
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
    const user = await currentUser();
    
    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, groupId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // If groupId is provided, verify user is a member
    if (groupId) {
      const membership = await prisma.chatGroupMember.findUnique({
        where: {
          userId_groupId: {
            userId,
            groupId
          }
        }
      });

      if (!membership) {
        return NextResponse.json(
          { error: 'You are not a member of this group' },
          { status: 403 }
        );
      }
    }

    // Create the message
    const chatMessage = await prisma.chatMessage.create({
      data: {
        content: message,
        user: {
          connect: {
            id: userId
          }
        },
        group: groupId ? {
          connect: {
            id: groupId
          }
        } : undefined,
        username: user.firstName || user.username || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Anonymous'
      }
    });

    // Transform the message for response
    const transformedMessage = {
      id: chatMessage.id,
      content: chatMessage.content,
      username: chatMessage.username,
      groupId: chatMessage.groupId,
      createdAt: chatMessage.createdAt
    };

    return NextResponse.json(transformedMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}