import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple mobile UA check
function isMobile(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /Android|iPhone|iPad|iPod|Mobile|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip next internal, static and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public') ||
    pathname.match(/\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  // Already on disclaimer
  if (pathname.startsWith('/disclaimer')) {
    return NextResponse.next();
  }

  const accepted = req.cookies.get('aureus_disclaimer_accepted')?.value === 'true';
  const ua = req.headers.get('user-agent');

  // TEMP: Disable mobile redirect to avoid blocking access while we fix UX
  // if (!accepted && isMobile(ua)) {
  //   const url = req.nextUrl.clone();
  //   url.pathname = '/disclaimer';
  //   return NextResponse.redirect(url);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|.*\..*).*)'],
};


