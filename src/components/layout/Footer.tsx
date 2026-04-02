import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import Logo from "../ui/Logo";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 text-right">
            <Link href="/" className="inline-block mb-6">
              <Logo />
            </Link>
            <p className="text-gray-500 font-medium leading-relaxed max-w-sm">
              NabTech هي المنصة الأولى المتخصصة لمساعدة المعلمين في إدارة دروسهم وطلابهم واشتراكاتهم بكل احترافية وأمان.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-black text-slate-900 mb-6 relative inline-block">
              روابط سريعة
              <span className="absolute -bottom-2 right-0 w-8 h-1 bg-red-500 rounded-full"></span>
            </h4>
            <ul className="space-y-4">
              <li><Link href="#features" className="text-gray-500 hover:text-red-500 font-medium transition-colors">المميزات</Link></li>
              <li><Link href="#how-it-works" className="text-gray-500 hover:text-red-500 font-medium transition-colors">كيف تعمل المنصة</Link></li>
              <li><Link href="#pricing" className="text-gray-500 hover:text-red-500 font-medium transition-colors">الأسعار</Link></li>
              <li><Link href="/login" className="text-gray-500 hover:text-red-500 font-medium transition-colors">تسجيل الدخول</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-black text-slate-900 mb-6 relative inline-block">
              تواصل معنا
              <span className="absolute -bottom-2 right-0 w-8 h-1 bg-red-500 rounded-full"></span>
            </h4>
            <ul className="space-y-6">
              <li className="flex items-center gap-3 text-gray-500">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-red-500">
                  <Mail className="w-5 h-5" />
                </div>
                <span dir="ltr" className="font-bold">nabawyali8@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-red-500">
                  <Phone className="w-5 h-5" />
                </div>
                <span dir="ltr" className="font-bold">+20 1008957399</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          <p className="text-sm font-bold text-gray-400">
            جميع الحقوق محفوظة © {new Date().getFullYear()} NabTech
          </p>
          <div className="flex gap-6 text-sm font-bold text-gray-400">
            <Link href="#" className="hover:text-red-500 transition-colors">سياسة الخصوصية</Link>
            <Link href="#" className="hover:text-red-500 transition-colors">الشروط والأحكام</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
