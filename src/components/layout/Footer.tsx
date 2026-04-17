"use client";

import Link from "next/link";
import { Mail, Phone, ArrowUpLeft } from "lucide-react";
import Logo from "../ui/Logo";

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-800/60 pt-24 pb-12 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-sky-400/5 dark:bg-sky-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
          <div className="col-span-1 md:col-span-5 space-y-8">
            <Link href="/" className="inline-block hover:scale-105 transition-transform">
              <Logo className="text-slate-900 dark:text-white" />
            </Link>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed max-w-sm">
              NabTech هي المنصة الأولى المتخصصة لمساعدة المعلمين في إدارة دروسهم وطلابهم واشتراكاتهم بكل احترافية وأمان، مصممة بأحدث التقنيات وأفضل تجربة مستخدم.
            </p>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-8 tracking-tight">
              المنصة
            </h4>
            <ul className="space-y-4">
              {[
                { label: "المميزات", href: "#features" },
                { label: "كيف نعمل", href: "#how-it-works" },
                { label: "الأسعار", href: "#pricing" },
                { label: "المسارات", href: "#audience" }
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 font-bold transition-all flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-8 tracking-tight">
              الدعم
            </h4>
            <ul className="space-y-4">
              {[
                { label: "تسجيل الدخول", href: "/login" },
                { label: "انضم كطالب", href: "/join?role=student" },
                { label: "سجل كمدرس", href: "/register-teacher" },
                { label: "مركز المساعدة", href: "#" }
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 font-bold transition-all flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 md:col-span-3">
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-8 tracking-tight">
              تواصل معنا
            </h4>
            <ul className="space-y-5">
              <li>
                <a href="mailto:nabawyali8@gmail.com" className="flex items-center gap-4 text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 font-bold transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 group-hover:border-sky-200 dark:group-hover:border-sky-500/30 transition-all">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span dir="ltr">nabawyali8@gmail.com</span>
                </a>
              </li>
              <li>
                <a href="tel:01008957399" className="flex items-center gap-4 text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 font-bold transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 group-hover:border-sky-200 dark:group-hover:border-sky-500/30 transition-all">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span dir="ltr">+20 1008957399</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-800/50 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-base font-bold text-slate-400 dark:text-slate-500">
            جميع الحقوق محفوظة © {new Date().getFullYear()} <span className="text-sky-500">NabTech</span>
          </p>
          <div className="flex items-center gap-8 text-base font-bold text-slate-400 dark:text-slate-500">
            <Link href="#" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">سياسة الخصوصية</Link>
            <Link href="#" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">الشروط والأحكام</Link>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:bg-sky-500 hover:text-white transition-all shadow-sm active:scale-90"
            >
              <ArrowUpLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
