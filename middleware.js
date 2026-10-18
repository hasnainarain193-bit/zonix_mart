import { NextResponse } from 'next/server';

export function middleware(request) {
  // Purana rigid cookie loop hata diya hai. 
  // Ab admin page khud secure tariqe se authorization handle karega.
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
