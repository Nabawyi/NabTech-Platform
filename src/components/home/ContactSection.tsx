"use client";

import { Mail, Phone, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactSection() {
  return (
    <section className="py-24 bg-gray-50/50 dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden" id="contact">
      <div className="container relative mx-auto px-4 sm:px-6 z-10 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-blue-500 font-bold tracking-wider uppercase text-sm mb-3 block inline-block py-1 px-3 bg-blue-50 dark:bg-blue-500/10 rounded-full">تواصل معنا</span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6">
            نحن هنا لمساعدتك دائماً
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
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
            className="flex flex-col items-center text-center p-8 bg-white dark:bg-slate-800 rounded-[2rem] border border-gray-100 dark:border-slate-700 hover:border-blue-200 hover:shadow-lg hover:-translate-y-2 dark:hover:border-blue-500/30 transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm mb-6 group-hover:bg-blue-500 group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <Mail className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">البريد الإلكتروني</h3>
            <p className="text-gray-500 dark:text-gray-400 font-bold text-sm" dir="ltr">nabawyali8@gmail.com</p>
          </motion.a>

          {/* Phone */}
          <motion.a 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            href="tel:01008957399"
            className="flex flex-col items-center text-center p-8 bg-white dark:bg-slate-800 rounded-[2rem] border border-gray-100 dark:border-slate-700 hover:border-blue-200 hover:shadow-lg hover:-translate-y-2 dark:hover:border-blue-500/30 transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm mb-6 group-hover:bg-blue-500 group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <Phone className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">رقم الهاتف</h3>
            <p className="text-gray-500 dark:text-gray-400 font-bold text-sm" dir="ltr">01008957399</p>
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
            className="flex flex-col items-center text-center p-8 bg-emerald-50 dark:bg-emerald-500/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-500/20 hover:border-emerald-300 hover:shadow-lg hover:-translate-y-2 transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-white dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm mb-6 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <MessageCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-50 mb-2">واتساب</h3>
            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">أرسل رسالة الآن</p>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
