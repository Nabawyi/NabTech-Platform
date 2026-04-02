import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('user_session');
  const { pathname } = request.nextUrl;

  // ─── Protect /owner (owner role only) ────────────────────────
  if (pathname.startsWith('/owner')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      const userData = JSON.parse(session.value);
      if (userData.role !== 'owner') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ─── Protect /admin and /teacher (admin role + must have teacherId) ───────
  if (pathname.startsWith('/admin') || pathname.startsWith('/teacher')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const userData = JSON.parse(session.value);
      if (userData.role !== 'admin') {
        if (userData.role === 'student') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        if (userData.role === 'owner') {
          return NextResponse.redirect(new URL('/owner', request.url));
        }
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Ensure session has a teacherId for data isolation
      if (!userData.teacherId) {
        // Invalid session — force re-login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('user_session');
        return response;
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ─── Protect /dashboard (student role only) ──────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const userData = JSON.parse(session.value);
      if (userData.role !== 'student') {
        if (userData.role === 'admin') {
          return NextResponse.redirect(new URL('/teacher', request.url));
        }
        if (userData.role === 'owner') {
          return NextResponse.redirect(new URL('/owner', request.url));
        }
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ─── Redirect logged-in users away from public pages ─────────
  if ((pathname === '/' || pathname === '/login' || pathname === '/join' || pathname === '/register-teacher') && session) {
    try {
      const userData = JSON.parse(session.value);
      if (userData.role === 'owner') {
        return NextResponse.redirect(new URL('/owner', request.url));
      } else if (userData.role === 'admin') {
        return NextResponse.redirect(new URL('/teacher', request.url));
      } else if (userData.role === 'student') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch {
      // Ignore parse errors here
    }
  }

  return NextResponse.next();
}


export const config = {
  matcher: ['/', '/admin', '/admin/:path*', '/teacher/:path*', '/dashboard/:path*', '/login', '/join', '/register-teacher', '/owner', '/owner/:path*'],
};
