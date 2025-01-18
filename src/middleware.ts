import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/api/debug",
    "/privacy",
    "/terms",
    "/_not-found",
  ],
  ignoredRoutes: [
    "/api/debug",
    "/((?!api|trpc))(_next.*|.+.[w]+$)",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};