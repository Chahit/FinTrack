import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ["/", "/login", "/signup", "/api/debug"]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};