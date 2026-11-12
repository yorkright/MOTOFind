import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;
  const requiresSignIn =
    pathname === '/chat' ||
    pathname.startsWith('/chat/') ||
    pathname === '/news' ||
    pathname.startsWith('/news/');

  if (requiresSignIn) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);

    await auth.protect(undefined, {
      unauthenticatedUrl: signInUrl.toString(),
    });
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};