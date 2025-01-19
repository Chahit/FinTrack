import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "@neondatabase/serverless";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First try to get existing settings
    const settings = await db.execute(sql`
      SELECT * FROM "UserSettings" WHERE "userId" = ${user.id}
    `);

    if (!settings.rows.length) {
      // Create default settings if they don't exist
      const newSettings = await db.execute(sql`
        INSERT INTO "UserSettings" ("userId", "theme", "currency", "language", "notifications", "portfolio")
        VALUES (
          ${user.id},
          'light',
          'USD',
          'en',
          '{}',
          '{}'
        )
        RETURNING *
      `);
      return NextResponse.json(newSettings.rows[0]);
    }

    return NextResponse.json(settings.rows[0]);
  } catch (error) {
    console.error("Error in settings route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
