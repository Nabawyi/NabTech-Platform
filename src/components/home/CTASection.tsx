"use client";

import Link from "next/link";
import { ArrowLeft, Rocket } from "lucide-react";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-x-0 bottom-0 top-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]"></div>
      
      <div className="container relative mx-auto px-4 sm:px-6 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 sm:p-20 text-center relative overflow-hidden"
        >
          {/* Accent Blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-[80px] -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full opacity-20 blur-[80px] -ml-20 -mb-20"></div>

          <div className="relative z-10 flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="bg-white/10 p-4 rounded-full mb-8 text-white backdrop-blur-sm"
            >
              <Rocket className="w-8 h-8" />
            </motion.div>
            
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
              ابدأ الآن وارتقِ بتجربتك التعليمية
            </h2>
            <p className="text-slate-300 text-lg sm:text-xl font-medium mb-10 max-w-2xl mx-auto">
              انضم لمجموعة المدرسين والطلاب الذين اتخذوا خطوة نحو مستقبل تعليمي منظم، متصل، وسلس.
            </p>
            <Link
              href="/register-teacher"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-10 py-5 text-xl font-bold text-white transition-all hover:bg-blue-600 hover:scale-[1.03] active:scale-95 shadow-xl shadow-blue-500/25 relative overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity bg-white"></span>
              إنشاء حساب جديد
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
