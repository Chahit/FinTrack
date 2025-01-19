'use client';

import { prisma } from '@/lib/prisma';
import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { Prisma, User } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
const AUTH_COOKIE_NAME = 'auth-token';

export interface UserSession {
  id: string;
  email: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

export async function createUser(email: string, password: string, name: string): Promise<UserSession> {
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword
    } as unknown as Prisma.UserCreateInput
  }) as unknown as User & { name: string };

  return {
    id: user.id,
    email: user.email,
    name: user.name
  };
}

export async function createSession(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(JWT_SECRET);

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        sessions: {
          deleteMany: {},
          create: {
            token,
            expiresAt
          }
        }
      } as unknown as Prisma.UserUpdateInput
    })
  ]);

  return token;
}

export async function validateSession(token: string): Promise<UserSession | null> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        sessions: {
          some: {
            token,
            expiresAt: {
              gt: new Date()
            }
          }
        }
      } as unknown as Prisma.UserWhereInput
    }) as unknown as User & { name: string } | null;

    if (!user) {
      return null;
    }

    // Verify the JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (typeof payload.userId !== 'string' || payload.userId !== user.id) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  } catch {
    return null;
  }
}

export async function signIn(email: string, password: string): Promise<{ user: UserSession; token: string } | null> {
  const user = await prisma.user.findUnique({
    where: { email }
  }) as unknown as (User & { name: string; password: string }) | null;

  if (!user || !(await verifyPassword(password, user.password))) {
    return null;
  }

  const token = await createSession(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    token
  };
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return validateSession(token);
}

export async function signOut(): Promise<void> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    const users = await prisma.user.findMany({
      where: {
        sessions: {
          some: {
            token
          }
        }
      } as unknown as Prisma.UserWhereInput,
      select: {
        id: true
      }
    });

    if (users.length > 0) {
      await prisma.user.update({
        where: { id: users[0].id },
        data: {
          sessions: {
            deleteMany: {
              token
            }
          }
        } as unknown as Prisma.UserUpdateInput
      });
    }
  }
}

// New functions to handle auth cookies
export function setAuthCookie(token: string): void {
  const cookieStore = cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/'
  });
}

export function removeAuthCookie(): void {
  const cookieStore = cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

// Alias for getCurrentUser to maintain compatibility
export const getSession = getCurrentUser; 