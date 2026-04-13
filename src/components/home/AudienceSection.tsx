"use client";

import Link from "next/link";
import { GraduationCap, Briefcase, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AudienceSection() {
  const teacherFeatures = [
    "إدارة الطلاب والمجموعات",
    "متابعة الاشتراكات آلياً",
    "تنظيم الدروس ورفع الفيديوهات",
    "كود دعوة خاص بك للطلاب"
  ];

  const studentFeatures = [
    "مشاهدة الدروس وتنزيل المذكرات",
    "حل الكويزات التفاعلية",
    "متابعة التقدم والدرجات",
    "التسجيل المباشر بكود المدرس"
  ];

  return (
    <section className="py-24 bg-gray-50/50 dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden" id="audience">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="text-blue-500 font-bold tracking-wider uppercase text-sm mb-3 block inline-block py-1 px-3 bg-blue-50 dark:bg-blue-500/10 rounded-full">تخصيص كامل</span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6">
            اختر المسار المناسب لك
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
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
            whileHover={{ y: -8, scale: 1.01 }}
            className="relative group bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 sm:p-12 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-[0.03] group-hover:opacity-10 blur-[60px] rounded-full -mr-20 -mt-20 transition-opacity duration-500"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10 relative z-10">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">للـمعلمين</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">إدارة متكاملة لعملك التعليمي</p>
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
                  <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="font-bold text-gray-600 dark:text-gray-300">{feature}</span>
                </motion.li>
              ))}
            </ul>

            <Link
              href="/join?role=teacher"
              className="block w-full text-center py-4 px-6 bg-slate-900 dark:bg-blue-500 text-white rounded-2xl font-bold transition-all hover:bg-slate-800 dark:hover:bg-blue-600 hover:scale-[1.02] active:scale-95 shadow-lg shadow-slate-900/20 dark:shadow-blue-500/20 relative z-10"
            >
              ابدأ كمدرس الآن
            </Link>
          </motion.div>

          {/* Student Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -8, scale: 1.01 }}
            className="relative group bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 sm:p-12 border border-slate-800 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 opacity-5 group-hover:opacity-20 blur-[60px] rounded-full -ml-20 -mt-20 transition-opacity duration-500"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10 relative z-10">
              <div className="w-16 h-16 bg-slate-800 dark:bg-indigo-500/10 text-white dark:text-indigo-400 rounded-2xl flex items-center justify-center flex-shrink-0 border border-slate-700 dark:border-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
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
                  <span className="font-bold text-slate-300">{feature}</span>
                </motion.li>
              ))}
            </ul>

            <Link
              href="/join?role=student"
              className="block w-full text-center py-4 px-6 bg-white dark:bg-indigo-500 text-slate-900 dark:text-white rounded-2xl font-bold transition-all hover:bg-gray-100 dark:hover:bg-indigo-600 hover:scale-[1.02] active:scale-95 shadow-lg relative z-10 border border-gray-200 dark:border-transparent"
            >
              انضم كطالب
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
