import { validateServerSession } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const user = await validateServerSession();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { portfolio: true }
    });

    if (!dbUser?.portfolio) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          portfolio: {
            create: {}
          }
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating user portfolio:', error);
    return NextResponse.json(
      { error: "Failed to create user portfolio" },
      { status: 500 }
    );
  }
}