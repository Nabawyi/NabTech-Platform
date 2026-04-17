"use client";

import { Mail, Phone, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactSection() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden" id="contact">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_30%,transparent_100%)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] opacity-30"></div>
      
      <div className="container relative mx-auto px-4 sm:px-6 z-10 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block py-1 px-3 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-full font-bold tracking-wider uppercase text-sm mb-4 border border-sky-100 dark:border-sky-800/30 shadow-sm">
            تواصل معنا
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            نحن هنا لمساعدتك دائماً
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xl">
            لديك استفسار؟ لا تتردد في التواصل معنا عبر أي من قنواتنا المباشرة.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Email */}
          <motion.a 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            href="mailto:nabawyali8@gmail.com"
            className="flex flex-col items-center text-center p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-lg shadow-sky-900/5 hover:border-sky-300 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-2 dark:hover:border-sky-500/40 transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-sky-50/50 to-transparent dark:from-sky-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-20 h-20 bg-sky-50 dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-sky-500 shadow-sm mb-6 group-hover:bg-sky-500 group-hover:text-white group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 relative z-10 border border-sky-100 dark:border-slate-700">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 relative z-10 tracking-tight">البريد الإلكتروني</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm relative z-10" dir="ltr">nabawyali8@gmail.com</p>
          </motion.a>

          {/* Phone */}
          <motion.a 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            href="tel:01008957399"
            className="flex flex-col items-center text-center p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-lg shadow-sky-900/5 hover:border-sky-300 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-2 dark:hover:border-sky-500/40 transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-sky-50/50 to-transparent dark:from-sky-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-20 h-20 bg-sky-50 dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-sky-500 shadow-sm mb-6 group-hover:bg-sky-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10 border border-sky-100 dark:border-slate-700">
              <Phone className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 relative z-10 tracking-tight">رقم الهاتف</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm relative z-10" dir="ltr">01008957399</p>
          </motion.a>

          {/* WhatsApp */}
          <motion.a 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            href="https://wa.me/201008957399"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center text-center p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/30 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/50 to-transparent dark:from-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-20 h-20 bg-white dark:bg-emerald-800/30 rounded-[1.5rem] flex items-center justify-center text-emerald-500 shadow-sm mb-6 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 relative z-10 border border-emerald-100 dark:border-emerald-700/50">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-emerald-900 dark:text-emerald-400 mb-2 relative z-10 tracking-tight">واتساب</h3>
            <p className="text-emerald-600 dark:text-emerald-500 font-bold text-sm relative z-10">أرسل رسالة الآن</p>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
