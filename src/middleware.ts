import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get('firebaseAuthToken')?.value

  if (request.nextUrl.pathname.startsWith('/login') && currentUser) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!currentUser && !request.nextUrl.pathname.startsWith('/login')) {
     return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
