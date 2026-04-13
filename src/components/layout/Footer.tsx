"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import Logo from "../ui/Logo";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 pt-20 pb-8 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="col-span-1 md:col-span-5 text-right space-y-6">
            <Link href="/" className="inline-block">
              <Logo />
            </Link>
            <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-sm">
              NabTech هي المنصة الأولى المتخصصة لمساعدة المعلمين في إدارة دروسهم وطلابهم واشتراكاتهم بكل احترافية وأمان، مصممة بأحدث التقنيات وأفضل تجربة مستخدم.
            </p>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider">
              المنصة
            </h4>
            <ul className="space-y-4">
              <li><Link href="#features" className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 font-medium transition-colors">المميزات</Link></li>
              <li><Link href="#how-it-works" className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 font-medium transition-colors">كيف تعمل المنصة</Link></li>
              <li><Link href="#pricing" className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 font-medium transition-colors">الأسعار</Link></li>
              <li><Link href="#audience" className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 font-medium transition-colors">المسارات</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider">
              الدعم
            </h4>
            <ul className="space-y-4">
              <li><Link href="/login" className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 font-medium transition-colors">تسجيل الدخول</Link></li>
              <li><Link href="/join?role=student" className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 font-medium transition-colors">انضم كطالب</Link></li>
              <li><Link href="/register-teacher" className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 font-medium transition-colors">سجل كمدرس</Link></li>
              <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 font-medium transition-colors">مركز المساعدة</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider">
              تواصل معنا
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:nabawyali8@gmail.com" className="flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 font-medium transition-colors group">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span dir="ltr">nabawyali8@gmail.com</span>
                </a>
              </li>
              <li>
                <a href="tel:01008957399" className="flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 font-medium transition-colors group">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <span dir="ltr">+20 1008957399</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 dark:border-slate-800/50 pt-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          <p className="text-sm font-bold text-gray-400 dark:text-gray-500">
            جميع الحقوق محفوظة © {new Date().getFullYear()} NabTech
          </p>
          <div className="flex gap-6 text-sm font-bold text-gray-400 dark:text-gray-500">
            <Link href="#" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">سياسة الخصوصية</Link>
            <Link href="#" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">الشروط والأحكام</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
