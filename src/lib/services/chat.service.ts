'use client';

import { prisma } from '@/lib/prisma';
import type { ChatGroup as PrismaChatGroup, ChatGroupMember, Prisma } from '@prisma/client';

export interface ChatGroup {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  members: { userId: string; name: string }[];
}

type GroupWithMembers = PrismaChatGroup & {
  members: (ChatGroupMember & { name: string })[];
};

export class ChatService {
  static async createGroup(name: string, userId: string, userName: string): Promise<ChatGroup> {
    // Generate a random invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const createData = {
      name,
      inviteCode,
      createdBy: userId,
      members: {
        create: {
          userId,
          name: userName,
          isAdmin: true
        } as unknown as Prisma.ChatGroupMemberCreateWithoutGroupInput
      }
    };

    const group = await prisma.chatGroup.create({
      data: createData,
      include: {
        members: true
      }
    }) as unknown as GroupWithMembers;

    return {
      id: group.id,
      name: group.name,
      inviteCode: group.inviteCode,
      createdBy: group.createdBy,
      members: group.members.map(member => ({
        userId: member.userId,
        name: member.name
      }))
    };
  }

  static async joinGroup(inviteCode: string, userId: string, userName: string): Promise<ChatGroup> {
    // First check if the group exists
    const existingGroup = await prisma.chatGroup.findUnique({
      where: { inviteCode },
      include: { members: true }
    }) as unknown as GroupWithMembers | null;

    if (!existingGroup) {
      throw new Error('Group not found');
    }

    // Check if user is already a member
    const isAlreadyMember = existingGroup.members.some(member => member.userId === userId);
    if (isAlreadyMember) {
      throw new Error('User is already a member of this group');
    }

    // Add user to the group
    const updateData = {
      members: {
        create: {
          userId,
          name: userName,
          isAdmin: false
        } as unknown as Prisma.ChatGroupMemberCreateWithoutGroupInput
      }
    };

    const group = await prisma.chatGroup.update({
      where: { inviteCode },
      data: updateData,
      include: {
        members: true
      }
    }) as unknown as GroupWithMembers;

    return {
      id: group.id,
      name: group.name,
      inviteCode: group.inviteCode,
      createdBy: group.createdBy,
      members: group.members.map(member => ({
        userId: member.userId,
        name: member.name
      }))
    };
  }

  static async deleteGroup(groupId: string, userId: string): Promise<void> {
    // Check if the user is the creator of the group
    const group = await prisma.chatGroup.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      throw new Error('Group not found');
    }

    if (group.createdBy !== userId) {
      throw new Error('Only the group creator can delete the group');
    }

    // Delete the group and all related data (members will be automatically deleted due to cascade)
    await prisma.chatGroup.delete({
      where: { id: groupId }
    });
  }

  static async getGroups(userId: string): Promise<ChatGroup[]> {
    const groups = await prisma.chatGroup.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: true
      }
    }) as unknown as GroupWithMembers[];

    return groups.map(group => ({
      id: group.id,
      name: group.name,
      inviteCode: group.inviteCode,
      createdBy: group.createdBy,
      members: group.members.map(member => ({
        userId: member.userId,
        name: member.name
      }))
    }));
  }
} 