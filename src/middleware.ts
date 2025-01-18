import { authMiddleware, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Configure auth middleware with public routes
export default authMiddleware({
  publicRoutes: ["/", "/login", "/signup", "/api/debug"],
  async afterAuth(auth, req) {
    // Only proceed if we have a userId and not accessing debug route
    if (auth.userId && !req.url.includes('/api/debug')) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: auth.userId },
          include: { portfolio: true }
        });

        if (!user) {
          const clerkUser = await clerkClient.users.getUser(auth.userId);
          await prisma.user.create({
            data: {
              id: auth.userId,
              email: clerkUser.emailAddresses[0]?.emailAddress || '',
              portfolio: {
                create: {}
              }
            }
          });
        }
      } catch (error) {
        console.error('Error in auth middleware:', error);
      }
    }
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};