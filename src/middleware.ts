import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/sign-in*',
    '/sign-up*',
    '/api/traderoom',
    '/api/webhook',
    '/terms',
    '/privacy'
  ]
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
  runtime: 'experimental-edge',
};