import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { 
        userId,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json({ message: "Error fetching notifications" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await req.json();
    if (!notificationId) {
      return NextResponse.json({ message: "Notification ID is required" }, { status: 400 });
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId
      }
    });

    if (!notification) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json({ message: "Error updating notification" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const alertId = searchParams.get('alertId');

    if (!alertId) {
      return NextResponse.json({ message: "Alert ID is required" }, { status: 400 });
    }

    const alert = await prisma.alert.findFirst({
      where: {
        id: alertId,
        userId
      }
    });

    if (!alert) {
      return NextResponse.json({ message: "Alert not found" }, { status: 404 });
    }

    await prisma.alert.delete({
      where: { id: alertId }
    });

    return NextResponse.json({ message: "Alert deleted successfully" });
  } catch (error) {
    console.error('Alert deletion error:', error);
    return NextResponse.json({ message: "Error deleting alert" }, { status: 500 });
  }
}
