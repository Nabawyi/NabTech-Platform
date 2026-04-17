"use client";

import Link from "next/link";
import { GraduationCap, Briefcase, CheckCircle2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function AudienceSection() {
  const teacherFeatures = [
    "إدارة الطلاب والمجموعات بدقة",
    "متابعة الاشتراكات آلياً",
    "تنظيم الدروس ورفع الفيديوهات",
    "كود دعوة خاص بك للطلاب"
  ];

  const studentFeatures = [
    "مشاهدة الدروس وتنزيل المذكرات",
    "حل الكويزات التفاعلية والتقييم",
    "متابعة التقدم والدرجات",
    "التسجيل المباشر بكود المدرس"
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden" id="audience">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_30%,transparent_100%)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] opacity-30"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-block py-1 px-3 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-full font-bold tracking-wider uppercase text-sm mb-4 border border-sky-100 dark:border-sky-800/30 shadow-sm">
            تخصيص كامل
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            اختر المسار المناسب لك
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xl">
            صُممت المنصة لتلبي احتياجات المعلم والطالب بأحدث التقنيات وأسهل واجهة استخدام.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Teacher Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="relative group bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 border border-sky-100 dark:border-slate-800 shadow-xl shadow-sky-900/5 hover:shadow-2xl hover:shadow-sky-500/20 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500 opacity-5 group-hover:opacity-10 blur-[60px] rounded-full -mr-20 -mt-20 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10 relative z-10">
              <div className="w-16 h-16 bg-sky-50 dark:bg-slate-800 text-sky-500 dark:text-sky-400 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300 shadow-sm border border-sky-100 dark:border-slate-700">
                <Briefcase className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">للـمعلمين</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">إدارة متكاملة لعملك التعليمي</p>
              </div>
            </div>

            <ul className="space-y-4 mb-12 relative z-10">
              {teacherFeatures.map((feature, i) => (
                <motion.li 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  className="flex items-center gap-4"
                >
                  <div className="w-6 h-6 rounded-full bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-sky-500" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{feature}</span>
                </motion.li>
              ))}
            </ul>

            <Link
              href="/register-teacher"
              className="flex items-center justify-center gap-2 w-full text-center py-4 px-6 bg-slate-900 dark:bg-sky-500 text-white rounded-2xl font-bold transition-all hover:bg-slate-800 dark:hover:bg-sky-600 hover:scale-[1.02] active:scale-95 shadow-lg shadow-slate-900/20 dark:shadow-sky-500/20 relative z-10 group/btn"
            >
              <span>ابدأ كمدرس الآن</span>
              <ArrowLeft className="w-5 h-5 group-hover/btn:-translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Student Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="relative group bg-slate-900 dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 border border-slate-800 shadow-xl shadow-indigo-900/10 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 opacity-5 group-hover:opacity-10 blur-[60px] rounded-full -ml-20 -mt-20 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10 relative z-10">
              <div className="w-16 h-16 bg-slate-800 dark:bg-slate-800 text-indigo-400 rounded-2xl flex items-center justify-center flex-shrink-0 border border-slate-700 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white mb-2">للطلاب</h3>
                <p className="text-sm font-medium text-slate-400">تجربة تعليمية حديثة وممتعة</p>
              </div>
            </div>

            <ul className="space-y-4 mb-12 relative z-10">
              {studentFeatures.map((feature, i) => (
                <motion.li 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="flex items-center gap-4"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-800 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="font-bold text-slate-200">{feature}</span>
                </motion.li>
              ))}
            </ul>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full text-center py-4 px-6 bg-white dark:bg-indigo-500 text-slate-900 dark:text-white rounded-2xl font-bold transition-all hover:bg-slate-50 dark:hover:bg-indigo-600 hover:scale-[1.02] active:scale-95 shadow-lg relative z-10 border border-slate-200 dark:border-transparent group/btn"
            >
              <span>انضم كطالب</span>
              <ArrowLeft className="w-5 h-5 group-hover/btn:-translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
