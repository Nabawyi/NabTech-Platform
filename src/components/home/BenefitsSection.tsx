"use client";

import { CheckCircle2, Shield, Zap, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function BenefitsSection() {
  const benefits = [
    "وفر وقتك من المهام المتكررة",
    "نظم شغلك ودروسك بطريقة احترافية",
    "زود دخلك بمتابعة الاشتراكات آلياً",
    "كل حاجة في مكان واحد (دروس، امتحانات، حضور)"
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300 relative" id="benefits">
      {/* Decorative Gradients to match Hero */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase text-sm mb-3 block inline-block py-1.5 px-4 bg-blue-50 dark:bg-blue-500/10 rounded-full border border-blue-100 dark:border-blue-500/20">
              القيمة المُضافة
            </span>
            <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight text-slate-900 dark:text-white">
              لماذا يستخدم المدرسون <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">NabTech</span>؟
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed font-medium">
              تم تصميم النظام خصيصاً ليحل المشاكل التقنية والتنظيمية التي يواجهها المعلم الحديث، ليلتفت بالكامل لعملية الشرح والإبداع.
            </p>
            <ul className="space-y-5">
              {benefits.map((benefit, i) => (
                <motion.li 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 blur-3xl rounded-[3rem] -z-10 animate-pulse"></div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-blue-500/10 backdrop-blur-sm">
               <div className="flex flex-col gap-6">
                  <motion.div 
                    whileHover={{ x: -10 }}
                    className="flex items-center gap-5 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[1.8rem] border border-slate-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 text-emerald-500 shadow-sm flex items-center justify-center flex-shrink-0 border border-slate-100 dark:border-slate-700">
                      <Zap className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-lg">المركزية والسرعة</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">الوصول لبيانات 1000 طالب في جزء من الثانية.</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ x: -10 }}
                    className="flex items-center gap-5 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[1.8rem] border border-slate-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all shadow-sm sm:rtl:mr-8 sm:ltr:ml-8"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 text-blue-500 shadow-sm flex items-center justify-center flex-shrink-0 border border-slate-100 dark:border-slate-700">
                      <Shield className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-lg">أمان وحماية</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">بيانات طلابك مشفرة ومتاحة لك أنت فقط.</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ x: -10 }}
                    className="flex items-center gap-5 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[1.8rem] border border-slate-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 text-purple-500 shadow-sm flex items-center justify-center flex-shrink-0 border border-slate-100 dark:border-slate-700">
                      <RefreshCw className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-lg">تحديثات مستمرة</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">إضافة ميزات أسبوعية بناءً على طلبات المعلمين.</p>
                    </div>
                  </motion.div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
