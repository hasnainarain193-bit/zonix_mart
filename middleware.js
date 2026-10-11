import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();

  // Strict check matrix for the administrative dashboard endpoint
  if (url.pathname.startsWith('/admin')) {
    const adminSessionToken = request.cookies.get('zonix_admin_auth')?.value;

    if (!adminSessionToken || adminSessionToken !== 'authorized_hasnainarain193') {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
