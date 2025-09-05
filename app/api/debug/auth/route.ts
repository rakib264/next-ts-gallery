import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token'
    });

    const cookies = req.cookies.getAll();
    const headers = Object.fromEntries(req.headers.entries());

    return NextResponse.json({
      success: true,
      debug: {
        environment: process.env.NODE_ENV,
        hasToken: !!token,
        tokenData: token ? {
          sub: token.sub,
          role: (token as any).role,
          exp: token.exp,
          iat: token.iat
        } : null,
        cookies: cookies.map(c => ({
          name: c.name,
          hasValue: !!c.value,
          valueLength: c.value?.length || 0
        })),
        relevantHeaders: {
          host: headers.host,
          'x-forwarded-proto': headers['x-forwarded-proto'],
          'x-forwarded-host': headers['x-forwarded-host'],
          'user-agent': headers['user-agent']
        },
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        environment: process.env.NODE_ENV,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
      }
    }, { status: 500 });
  }
}
