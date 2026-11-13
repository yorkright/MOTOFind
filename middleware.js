import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = (pathname) =>
  pathname === '/chat' ||
  pathname.startsWith('/chat/') ||
  pathname === '/news' ||
  pathname.startsWith('/news/');

const hasClerkKeys =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  Boolean(process.env.CLERK_SECRET_KEY);

const handleAuthenticatedRequest = async (auth, request) => {
  const { pathname } = request.nextUrl;

  if (isProtectedRoute(pathname)) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = '/sign-in';
    signInUrl.search = '';
    signInUrl.hash = '';
    signInUrl.searchParams.set('redirect_url', request.url);

    await auth.protect(undefined, {
      unauthenticatedUrl: signInUrl.toString(),
    });
  }
};

const clerkHandler = clerkMiddleware(handleAuthenticatedRequest);

export default async function middleware(request, event) {
  if (!hasClerkKeys) {
    return NextResponse.json(
      { error: 'Authentication is not configured. Contact the site administrator.' },
      { status: 503 },
    );
  }

  try {
    return await clerkHandler(request, event);
  } catch (error) {
    console.error('Clerk middleware failed:', error);
    return NextResponse.json(
      { error: 'Authentication is temporarily unavailable.' },
      { status: 503 },
    );
  }
}

export const config = {
  matcher: [
    // Run on authenticated pages, Clerk auth consumers, and its optional auto-proxy path.
    '/chat/:path*',
    '/news/:path*',
    '/api/conversations/:path*',
    '/__clerk/:path*',
  ],
};