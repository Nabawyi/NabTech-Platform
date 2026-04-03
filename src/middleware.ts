import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
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

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url);
  };

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    role = profile?.role ?? null;
  }

  if (pathname.startsWith('/owner')) {
    if (!user || role !== 'owner') return redirectTo('/login');
  }

  if (pathname.startsWith('/teacher') || pathname.startsWith('/admin')) {
    if (!user) return redirectTo('/login');
    if (role === 'student') return redirectTo('/dashboard');
    if (role === 'owner') return redirectTo('/owner');
    if (role !== 'teacher') return redirectTo('/login');
  }

  if (pathname.startsWith('/dashboard')) {
    if (!user) return redirectTo('/login');
    if (role === 'teacher') return redirectTo('/teacher');
    if (role === 'owner') return redirectTo('/owner');
    if (role !== 'student') return redirectTo('/login');
  }

  if (
    (pathname === '/' || pathname === '/login' || pathname === '/join' || pathname === '/register-teacher') &&
    user && role
  ) {
    if (role === 'owner') return redirectTo('/owner');
    if (role === 'teacher') return redirectTo('/teacher');
    if (role === 'student') return redirectTo('/dashboard');
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
