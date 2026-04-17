"use client";

import Link from "next/link";
import { ArrowLeft, Rocket, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-24 bg-sky-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300 border-t border-sky-100 dark:border-slate-800/50">
      {/* Background Grid Pattern */}
      <div className="absolute inset-x-0 bottom-0 top-0 bg-[linear-gradient(to_right,#0ea5e91a_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e91a_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#38bdf81a_1px,transparent_1px),linear-gradient(to_bottom,#38bdf81a_1px,transparent_1px)] opacity-50"></div>
      
      <div className="container relative mx-auto px-4 sm:px-6 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-slate-900 dark:bg-slate-900 border border-slate-800 rounded-[3rem] p-10 sm:p-20 text-center relative overflow-hidden shadow-2xl"
        >
          {/* Accent Blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500 rounded-full opacity-20 blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500 rounded-full opacity-20 blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="bg-white/10 border border-white/20 p-4 rounded-2xl mb-8 text-white backdrop-blur-md shadow-lg"
            >
              <Rocket className="w-8 h-8 text-sky-300" />
            </motion.div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
              ابدأ الآن وارتقِ بتجربتك التعليمية
            </h2>
            <p className="text-sky-100 text-lg sm:text-xl font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
              انضم لمجموعة المدرسين والطلاب الذين اتخذوا خطوة نحو مستقبل تعليمي منظم، متصل، وسلس مع NabTech.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
              <Link
                href="/register-teacher"
                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-orange-500 px-10 py-5 text-xl font-bold text-white transition-all hover:bg-orange-600 hover:scale-[1.02] active:scale-95 shadow-xl shadow-orange-500/30 relative overflow-hidden w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                <Sparkles className="w-5 h-5 relative z-10" />
                <span className="relative z-10">إنشاء حساب جديد</span>
                <ArrowLeft className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <p className="mt-6 text-sm text-sky-200/60 flex gap-2 items-center justify-center">
              <span>✓ لا يلزم بطاقة ائتمان</span>
              <span>•</span>
              <span>✓ إعداد في دقيقتين</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
