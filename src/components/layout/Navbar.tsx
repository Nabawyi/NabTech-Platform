import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { getUserSession } from '@/app/actions/students';
import LogoutButton from './LogoutButton';
import DarkModeToggle from './DarkModeToggle';

export default async function Navbar() {
  const session = await getUserSession();
  const isAdmin = session?.role === "admin" || session?.role === "teacher";
  const logoHref = session ? (isAdmin ? "/teacher" : (session.role === "owner" ? "/owner" : "/student")) : "/";

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-900 border-b border-slate-800 shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={logoHref}>
          <Logo className="brightness-0 invert" />
        </Link>
        
        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <DarkModeToggle />
          {session ? (
            <>
              <Link 
                href={logoHref} 
                className="text-sm font-bold bg-blue-500 text-white px-5 sm:px-6 py-2 rounded-full hover:bg-blue-600 transition-all shadow-md"
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
                className="text-sm font-bold bg-blue-500 text-white px-5 sm:px-6 py-2 rounded-full hover:bg-blue-600 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:-translate-y-0.5 shadow-md"
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
