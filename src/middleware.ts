// middleware.ts - COMENTADO/DESACTIVADO
// El middleware está interfiriendo con Firebase Auth
// Usamos ProtectedRoute/AuthGuard en el lado cliente en su lugar

/*
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
*/

// Middleware vacío para permitir que la autenticación del lado cliente maneje todo
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.next()
}