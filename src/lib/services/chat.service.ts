'use client';

import { prisma } from '@/lib/prisma';
import type { ChatGroup as PrismaChatGroup, ChatGroupMember, ChatMessage as PrismaChatMessage, Prisma, User } from '@prisma/client';

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  groupId: string;
  user: {
    id: string;
    name: string | null;
  };
}

export interface ChatGroup {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  members: { userId: string; name: string }[];
}

type GroupWithMembers = PrismaChatGroup & {
  members: (ChatGroupMember & { user: User })[];
};

type MessageWithUser = PrismaChatMessage & {
  user: User;
};

export class ChatService {
  async getUserGroups(userId: string): Promise<ChatGroup[]> {
    const groups = await prisma.chatGroup.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    }) as unknown as (PrismaChatGroup & { members: (ChatGroupMember & { user: User })[] })[];

    return groups.map(group => ({
      id: group.id,
      name: group.name,
      inviteCode: group.inviteCode,
      createdBy: group.createdBy,
      members: group.members.map(member => ({
        userId: member.userId,
        name: member.user.name || 'Unknown'
      }))
    }));
  }

  async getGroupMessages(groupId: string): Promise<ChatMessage[]> {
    const messages = await prisma.chatMessage.findMany({
      where: { groupId },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    }) as unknown as MessageWithUser[];

    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      createdAt: msg.createdAt,
      userId: msg.userId,
      groupId: msg.groupId,
      user: {
        id: msg.user.id,
        name: msg.user.name
      }
    }));
  }

  async getNewMessages(groupId: string, lastMessageId: string): Promise<ChatMessage[]> {
    const lastMessage = await prisma.chatMessage.findUnique({
      where: { id: lastMessageId }
    });

    if (!lastMessage) {
      return [];
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        groupId,
        createdAt: {
          gt: lastMessage.createdAt
        }
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    }) as unknown as MessageWithUser[];

    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      createdAt: msg.createdAt,
      userId: msg.userId,
      groupId: msg.groupId,
      user: {
        id: msg.user.id,
        name: msg.user.name
      }
    }));
  }

  async sendMessage(data: { content: string; groupId: string; userId: string }): Promise<ChatMessage> {
    const message = await prisma.chatMessage.create({
      data: {
        content: data.content,
        groupId: data.groupId,
        userId: data.userId
      },
      include: {
        user: true
      }
    }) as unknown as MessageWithUser;

    return {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      userId: message.userId,
      groupId: message.groupId,
      user: {
        id: message.user.id,
        name: message.user.name
      }
    };
  }

  async createGroup(data: { name: string; createdBy: string }): Promise<ChatGroup> {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const group = await prisma.chatGroup.create({
      data: {
        name: data.name,
        inviteCode,
        createdBy: data.createdBy,
        members: {
          create: {
            userId: data.createdBy,
            isAdmin: true
          }
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    }) as unknown as GroupWithMembers;

    return {
      id: group.id,
      name: group.name,
      inviteCode: group.inviteCode,
      createdBy: group.createdBy,
      members: group.members.map(member => ({
        userId: member.userId,
        name: member.user.name || 'Unknown'
      }))
    };
  }

  async joinGroup(inviteCode: string, userId: string): Promise<ChatGroup> {
    const group = await prisma.chatGroup.findUnique({
      where: { inviteCode },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    }) as unknown as GroupWithMembers | null;

    if (!group) {
      throw new Error('Group not found');
    }

    if (group.members.some(member => member.userId === userId)) {
      throw new Error('Already a member of this group');
    }

    const updatedGroup = await prisma.chatGroup.update({
      where: { id: group.id },
      data: {
        members: {
          create: {
            userId,
            isAdmin: false
          }
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    }) as unknown as GroupWithMembers;

    return {
      id: updatedGroup.id,
      name: updatedGroup.name,
      inviteCode: updatedGroup.inviteCode,
      createdBy: updatedGroup.createdBy,
      members: updatedGroup.members.map(member => ({
        userId: member.userId,
        name: member.user.name || 'Unknown'
      }))
    };
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    await prisma.chatGroupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });
  }
}