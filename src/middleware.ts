import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    const isLoginRoute = request.nextUrl.pathname === '/login';
    const hasSession = request.cookies.has('viktor_admin_session');

    // Protect Admin Routes
    if (isAdminRoute && !hasSession) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect to Admin if already logged in
    if (isLoginRoute && hasSession) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};
