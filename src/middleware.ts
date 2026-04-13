import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables in middleware');
      return NextResponse.next();
    }

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
        // Log error if needed, but continue
    }

    const { pathname } = request.nextUrl;

    const redirectTo = (path: string) => {
      const url = request.nextUrl.clone();
      url.pathname = path;
      const redirectResponse = NextResponse.redirect(url);
      
      // Preserve cookies from supabaseResponse (important for session refresh)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, {
            path: cookie.path,
            domain: cookie.domain,
            maxAge: cookie.maxAge,
            secure: cookie.secure,
            sameSite: cookie.sameSite,
            httpOnly: cookie.httpOnly,
        });
      });
      
      return redirectResponse;
    };

    let role: string | null = null;
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!profileError) {
        role = profile?.role ?? null;
      }
    }

    // Protection logic
    if (pathname.startsWith('/owner')) {
      if (!user || role !== 'owner') return redirectTo('/login');
    }

    if (pathname.startsWith('/teacher') || pathname.startsWith('/admin')) {
      if (!user) return redirectTo('/login');
      if (role === 'student') return redirectTo('/student');
      if (role === 'owner') return redirectTo('/owner');
      if (role !== 'teacher') return redirectTo('/login');
    }

    if (pathname.startsWith('/dashboard')) {
      if (!user) return redirectTo('/login');
      if (role === 'teacher') return redirectTo('/teacher');
      if (role === 'owner') return redirectTo('/owner');
      if (role === 'student') return redirectTo('/student');
      if (role === 'admin') return redirectTo('/teacher');
      return redirectTo('/login');
    }

    if (
      (pathname === '/' || pathname === '/login' || pathname === '/join' || pathname === '/register-teacher') &&
      user && role
    ) {
      if (role === 'owner') return redirectTo('/owner');
      if (role === 'teacher') return redirectTo('/teacher');
      if (role === 'student') return redirectTo('/student');
    }

    return supabaseResponse;
  } catch (e) {
    console.error('Middleware error:', e);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
