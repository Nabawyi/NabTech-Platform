import { Mail, Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function ContactSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden" id="contact">
      <div className="container relative mx-auto px-4 sm:px-6 z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-red-500 font-bold tracking-wider uppercase text-sm mb-2 block">تواصل معنا</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">
            نحن هنا لمساعدتك دائماً
          </h2>
          <p className="text-gray-500 font-medium">
            لديك استفسار؟ لا تتردد في التواصل معنا عبر أي من الوسائل التالية.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Email */}
          <a 
            href="mailto:nabawyali8@gmail.com"
            className="flex flex-col items-center p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-all group"
          >
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm mb-6 group-hover:bg-red-500 group-hover:text-white transition-all">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">البريد الإلكتروني</h3>
            <p className="text-gray-500 font-bold text-sm" dir="ltr">nabawyali8@gmail.com</p>
          </a>

          {/* Phone */}
          <a 
            href="tel:01008957399"
            className="flex flex-col items-center p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-all group"
          >
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm mb-6 group-hover:bg-red-500 group-hover:text-white transition-all">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">رقم الهاتف</h3>
            <p className="text-gray-500 font-bold text-sm" dir="ltr">01008957399</p>
          </a>

          {/* WhatsApp */}
          <a 
            href="https://wa.me/201008957399"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-8 bg-emerald-50 rounded-3xl border border-emerald-100 hover:bg-emerald-100 transition-all group"
          >
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-emerald-900 mb-2">واتساب</h3>
            <p className="text-emerald-600 font-black text-sm">ابدأ دردشة الآن</p>
          </a>
        </div>
      </div>
    </section>
  );
}
