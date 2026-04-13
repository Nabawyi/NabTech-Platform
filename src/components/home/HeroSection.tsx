"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white min-h-[80vh] flex items-center py-20 dark:bg-slate-950 transition-colors duration-300">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]"></div>
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 -z-10 m-auto h-[500px] w-[500px] rounded-full bg-blue-500 opacity-[0.05] blur-[150px] pointer-events-none dark:opacity-[0.1]"></div>
      
      <div className="container relative mx-auto px-4 sm:px-6 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 px-5 py-2.5 backdrop-blur-sm shadow-sm"
          >
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 tracking-tight">المنصة التعليمية الأقوى في مصر</p>
          </motion.div>
          
          <h1 className="mb-8 text-5xl font-black leading-[1.2] text-slate-900 dark:text-white md:text-6xl lg:text-8xl tracking-tight">
            مستقبلك التعليمي <br className="hidden md:block" /> يبدأ من <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 inline-block relative px-2">NabTech</span>
          </h1>
          
          <p className="mb-10 text-xl font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            منصة متكاملة تواكب طموحك. سواء كنت معلماً يبحث عن وسيلة فعالة لإدارة دروسه، أو طالباً يسعى للتفوق بمنهجية حديثة.
          </p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/register-teacher" 
              className="group relative flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-8 py-4 text-lg font-bold text-white dark:text-slate-900 transition-all hover:bg-slate-800 dark:hover:bg-gray-100 hover:scale-[1.03] active:scale-95 shadow-xl shadow-slate-900/20 dark:shadow-white/10 overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none"></span>
              <Briefcase className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              ابدأ كمدرس
            </Link>
            
            <Link 
              href="/login" 
              className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-8 py-4 text-lg font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:scale-[1.03] active:scale-95 shadow-sm"
            >
              <GraduationCap className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform text-blue-500" />
              سجل كطالب
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
