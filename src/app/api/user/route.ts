import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function PUT(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    const body = await req.json();
    const { db } = await connectToDatabase();
    const users = db.collection("users");

    const user = await users.findOne({ userId });
    if (!user) {
      await users.insertOne({
        userId,
        ...body,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      await users.updateOne(
        { userId },
        {
          $set: {
            ...body,
            updatedAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { db } = await connectToDatabase();
    const users = db.collection("users");

    await users.deleteOne({ userId });

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ message: "Error deleting account" }, { status: 500 });
  }
}