"use client";

import { motion } from 'framer-motion';
import { 
  Users, MonitorPlay, FileCheck, CalendarCheck, 
  CreditCard, GraduationCap, Video, FileText, Share2, 
  BookOpen, Sparkles
} from 'lucide-react';

const teacherFeatures = [
  { id: 1, title: 'إدارة الطلاب بسهولة', description: 'تحكم كامل في قاعدة بيانات طلابك ومتابعة دقيقة لكل نشاط.', icon: Users },
  { id: 2, title: 'متابعة الاشتراكات', description: 'إدارة الاشتراكات الشهرية وتنبيهات الدفع بشكل آلي ومبسط.', icon: CreditCard },
  { id: 3, title: 'رفع فيديوهات و PDF', description: 'منصة آمنة لمشاركة محتواك التعليمي وحمايته من التسريب.', icon: MonitorPlay },
  { id: 4, title: 'تتبع الحضور', description: 'تسجيل ومتابعة حضور الطلاب في مجموعاتك بضغطة زر.', icon: CalendarCheck },
  { id: 5, title: 'نظام دعوات خاص', description: 'نظام دعوات وتعيين صلاحيات للطلاب.', icon: Share2 },
];

const studentFeatures = [
  { id: 1, title: 'مشاهدة الدروس بسهولة', description: 'واجهة بسيطة وسريعة لمتابعة المنهج بجودة عالية بدون تقطيع.', icon: Video },
  { id: 2, title: 'حل الكويزات', description: 'تقييم مستمر لمستواك من خلال اختبارات تفاعلية وتصحيح فوري.', icon: FileCheck },
  { id: 3, title: 'متابعة الحضور', description: 'سجل كامل بحضورك وغيابك في وتيرة التعلم لتبقى على اطلاع دائم.', icon: CalendarCheck },
  { id: 4, title: 'نظام اشتراك واضح', description: 'شفافية كاملة في مدفوعاتك واشتراكاتك مع تنبيهات قبل الانتهاء.', icon: BookOpen },
  { id: 5, title: 'تجربة تعليم حديثة', description: 'منصة عصرية تدعم التعلم في أي وقت وأي مكان على جميع الأجهزة.', icon: Sparkles },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden" id="features">
      {/* Background Decor */}
      <div className="absolute -left-40 top-40 w-96 h-96 bg-sky-200/40 dark:bg-sky-900/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -right-40 bottom-40 w-96 h-96 bg-indigo-200/40 dark:bg-indigo-900/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block py-1 px-3 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-bold tracking-wider uppercase text-sm mb-4"
          >
            المميزات
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight"
          >
            مصممة لخدمتك، أياً كان دورك
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 text-xl font-medium"
          >
            أدوات متخصصة تلبي احتياجات المعلم الذكي والطالب الطموح.
          </motion.p>
        </div>

        {/* Teachers Section */}
        <div className="mb-28">
          <div className="flex flex-col items-center gap-4 mb-12 text-center">
            <div className="p-4 bg-sky-100 dark:bg-sky-900/40 rounded-2xl text-sky-600 dark:text-sky-400 shadow-inner">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">للمعلمين</h3>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {teacherFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={`teacher-${feature.id}`}
                  variants={itemVariants}
                  className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-700/60 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-2 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 dark:bg-sky-900/10 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-sky-50 dark:bg-slate-900 text-sky-600 dark:text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300 shadow-sm border border-sky-100 dark:border-slate-800">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      {feature.title}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Students Section */}
        <div>
          <div className="flex flex-col items-center gap-4 mb-12 text-center">
            <div className="p-4 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-inner">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">للطلاب</h3>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {studentFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={`student-${feature.id}`}
                  variants={itemVariants}
                  className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-700/60 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-indigo-50 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300 shadow-sm border border-indigo-100 dark:border-slate-800">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      {feature.title}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
