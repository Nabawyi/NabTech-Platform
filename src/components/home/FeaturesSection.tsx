"use client";

import { motion } from 'framer-motion';
import { 
  Users, MonitorPlay, FileCheck, CalendarCheck, 
  CreditCard, GraduationCap, Video, FileText, Share2, 
  BookOpen, Sparkles
} from 'lucide-react';

const teacherFeatures = [
  { id: 1, title: 'إدارة الطلاب بسهولة', description: 'تحكم كامل في قاعدة بيانات طلابك ومتابعة دقيقة.', icon: Users },
  { id: 2, title: 'متابعة الاشتراكات', description: 'إدارة الاشتراكات الشهرية وتنبيهات الدفع.', icon: CreditCard },
  { id: 3, title: 'رفع فيديوهات و PDF', description: 'منصة آمنة لمشاركة محتواك التعليمي.', icon: MonitorPlay },
  { id: 4, title: 'تتبع الحضور', description: 'تسجيل ومتابعة حضور الطلاب في مجموعاتك.', icon: CalendarCheck },
  { id: 5, title: 'نظام دعوات خاص', description: 'نظام دعوات وتعيين صلاحيات للطلاب والمساعدين.', icon: Share2 },
];

const studentFeatures = [
  { id: 1, title: 'مشاهدة الدروس بسهولة', description: 'واجهة بسيطة وسريعة لمتابعة المنهج.', icon: Video },
  { id: 2, title: 'حل الكويزات', description: 'تقييم مستمر لمستواك من خلال اختبارات تفاعلية.', icon: FileCheck },
  { id: 3, title: 'متابعة الحضور', description: 'سجل كامل بحضورك وغيابك في وتيرة التعلم.', icon: CalendarCheck },
  { id: 4, title: 'نظام اشتراك واضح', description: 'شفافية كاملة في مدفوعاتك واشتراكاتك.', icon: BookOpen },
  { id: 5, title: 'تجربة تعليم حديثة', description: 'منصة عصرية تدعم التعلم في أي وقت وأي مكان.', icon: Sparkles },
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
    <section className="py-24 bg-gray-50/50 dark:bg-slate-900 transition-colors duration-300" id="features">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-blue-500 font-bold tracking-wider uppercase text-sm mb-2 block">المميزات</span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6">
            مصممة لخدمتك، أياً كان دورك
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            أدوات متخصصة تلبي احتياجات المعلم الذكي والطالب الطموح.
          </p>
        </div>

        {/* Teachers Section */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">للمعلمين</h3>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {teacherFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={`teacher-${feature.id}`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-300 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Students Section */}
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">للطلاب</h3>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {studentFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={`student-${feature.id}`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-300 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
