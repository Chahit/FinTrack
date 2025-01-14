import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("fintrack");
    const notifications = await db.collection("notifications")
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

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

    const { id, read } = await req.json();
    if (!id) {
      return NextResponse.json({ message: "Notification ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("fintrack");
    
    const result = await db.collection("notifications").updateOne(
      { _id: id, userId },
      { $set: { read } }
    );

    return NextResponse.json({ success: true });
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

    const client = await clientPromise;
    const db = client.db("fintrack");
    
    const result = await db.collection("notifications").deleteMany({ userId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notifications delete error:', error);
    return NextResponse.json({ message: "Error clearing notifications" }, { status: 500 });
  }
}
