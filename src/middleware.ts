import { NextResponse } from 'next/server';

export async function middleware(request: any) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login';

  // Get the token from the cookies
  const token = request.cookies.get('auth')?.value;

  // Redirect logic
  if (isPublicPath && token) {
    // If user is logged in and tries to access login page
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isPublicPath && !token) {
    // If user is not logged in and tries to access protected page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 