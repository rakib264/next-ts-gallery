import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    try {
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: process.env.NODE_ENV === 'production' 
          ? '__Secure-next-auth.session-token' 
          : 'next-auth.session-token'
      });

      // Debug logging for production
      if (process.env.NODE_ENV === 'production') {
        console.log('Middleware Debug:', {
          pathname,
          hasToken: !!token,
          tokenRole: token ? (token as any).role : 'no-token',
          cookies: req.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
        });
      }

      if (!token || ((token as any).role !== 'admin' && (token as any).role !== 'manager')) {
        const signInUrl = new URL('/auth/signin', req.nextUrl);
        signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search);
        return NextResponse.redirect(signInUrl);
      }
    } catch (error) {
      console.error('Middleware auth error:', error);
      const signInUrl = new URL('/auth/signin', req.nextUrl);
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};