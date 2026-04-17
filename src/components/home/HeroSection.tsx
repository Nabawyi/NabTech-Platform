"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, Star, ArrowLeft } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 dark:bg-slate-950 transition-colors duration-300">
      {/* Dynamic Background Patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] opacity-50"></div>
      
      {/* Ambient Glow */}
      <div className="absolute top-0 right-1/4 -z-10 w-[600px] h-[600px] rounded-full bg-sky-400/20 blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen dark:bg-sky-500/10"></div>
      <div className="absolute top-20 left-1/4 -z-10 w-[500px] h-[500px] rounded-full bg-orange-400/10 blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen dark:bg-orange-500/10"></div>
      
      <div className="container relative mx-auto px-4 sm:px-6 w-full flex-grow flex flex-col justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-5xl text-center"
        >
          {/* Top Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8 mx-auto inline-flex items-center gap-2.5 rounded-full border border-sky-100 dark:border-sky-900/50 bg-sky-50/80 dark:bg-sky-900/20 px-4 py-2 backdrop-blur-md shadow-sm"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
            <p className="text-sm font-semibold text-sky-800 dark:text-sky-200 tracking-wide">الجيل الجديد من منصات التعليم الذكية</p>
          </motion.div>
          
          {/* Main Heading */}
          <h1 className="mb-6 text-5xl font-black leading-[1.1] text-slate-900 dark:text-white md:text-7xl lg:text-[5.5rem] tracking-tight">
            مستقبلك التعليمي <br className="hidden md:block" /> 
            يبدأ من <span className="text-transparent bg-clip-text bg-gradient-to-l from-sky-400 via-sky-500 to-blue-600 inline-block relative pr-2 pb-2 drop-shadow-sm">NabTech</span>
          </h1>
          
          {/* Subtitle */}
          <p className="mb-12 text-xl md:text-2xl font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
            منصة متكاملة تواكب طموحك. سواء كنت معلماً يبحث عن وسيلة فعالة لإدارة دروسه، أو طالباً يسعى للتفوق بمنهجية حديثة.
          </p>
          
          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <Link 
              href="/register-teacher" 
              className="group relative flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-orange-500 hover:bg-orange-600 px-8 py-4 text-lg font-bold text-white transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-orange-500/25 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <Briefcase className="w-5 h-5 relative z-10" />
              <span className="relative z-10">ابدأ التدريس مجاناً</span>
              <ArrowLeft className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/login" 
              className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 px-8 py-4 text-lg font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-sky-300 dark:hover:border-sky-700 hover:scale-[1.02] active:scale-95 shadow-sm"
            >
              <GraduationCap className="w-5 h-5 text-sky-500 group-hover:scale-110 transition-transform" />
              <span>تسجيل دخول الطالب</span>
            </Link>
          </motion.div>

          

        </motion.div>
      </div>
    </section>
  );
}

