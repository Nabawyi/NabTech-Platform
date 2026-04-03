import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { getUserSession } from '@/app/actions/students';
import LogoutButton from './LogoutButton';

export default async function Navbar() {
  const session = await getUserSession();
  const isAdmin = session?.role === "admin";
  const logoHref = session ? (isAdmin ? "/admin" : "/dashboard") : "/";

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-900 border-b border-slate-800 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={logoHref}>
          <Logo className="brightness-0 invert" />
        </Link>
        
        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {session ? (
            <>
              <Link 
                href={isAdmin ? "/admin" : "/dashboard"} 
                className="text-sm font-bold bg-primary text-white px-5 sm:px-6 py-2 rounded-full hover:bg-primary-dark transition-all shadow-md"
              >
                لوحة التحكم
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-slate-800"
              >
                تسجيل الدخول
              </Link>
              <Link 
                href="/join" 
                className="text-sm font-bold bg-red-500 text-white px-5 sm:px-6 py-2 rounded-full hover:bg-red-600 transition-all focus:ring-2 focus:ring-red-500 focus:ring-offset-2 hover:-translate-y-0.5 shadow-md"
              >
                انضم إلينا
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
