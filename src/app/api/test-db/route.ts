import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Try to count users
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      status: 'Database connected successfully',
      userCount,
      tables: {
        User: await prisma.user.count(),
        Portfolio: await prisma.portfolio.count(),
        Asset: await prisma.asset.count(),
        Transaction: await prisma.transaction.count(),
        Notification: await prisma.notification.count(),
        ChatMessage: await prisma.chatMessage.count()
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      status: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 