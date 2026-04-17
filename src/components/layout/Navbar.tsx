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
    <nav className="sticky top-0 z-[100] w-full bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href={logoHref} className="hover:scale-105 transition-transform">
          <Logo className="text-slate-900 dark:text-white" />
        </Link>
        
        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden sm:flex items-center gap-6 rtl:ml-6 ltr:mr-6">
            {!session && (
              <>
                <Link href="#features" className="text-sm font-bold text-slate-500 hover:text-sky-500 transition-colors">المميزات</Link>
                <Link href="#pricing" className="text-sm font-bold text-slate-500 hover:text-sky-500 transition-colors">الأسعار</Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <DarkModeToggle />
            
            {session ? (
              <div className="flex items-center gap-3">
                <Link 
                  href={logoHref} 
                  className="hidden sm:flex items-center gap-2 text-sm font-black bg-sky-500 text-white px-6 py-2.5 rounded-2xl hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 active:scale-95"
                >
                  لوحة التحكم
                </Link>
                <LogoutButton />
              </div>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 transition-colors px-4 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/50"
                >
                  تسجيل الدخول
                </Link>
                <Link 
                  href="/join" 
                  className="text-sm font-black bg-gradient-to-l from-sky-400 to-blue-600 text-white px-6 py-2.5 rounded-2xl hover:shadow-xl hover:shadow-sky-500/20 transition-all active:scale-95 hover:-translate-y-0.5 border border-white/10"
                >
                  ابدأ الآن
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
