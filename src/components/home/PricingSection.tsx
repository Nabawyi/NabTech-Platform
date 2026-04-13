"use client";

import Link from "next/link";
import { Check, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingSection() {
  const plans = [
    {
      name: "الباقة الاحترافية",
      desc: "لتنظيم وإدارة الدروس والمنصة بكفاءة وسيطرة كاملة.",
      price: "تواصل معنا",
      duration: "للأسعار الخاصة",
      features: [
        "عدد غير محدود من الطلاب مجانًا",
        "إدارة كاملة للدروس والمحاضرات",
        "نظام كويزات آلي متقدم مدمج بالمنصة",
        "سجلات وتقارير تفصيلية لولي الأمر",
        "دعم فني شخصي 24/7 طوال الأسبوع"
      ],
      cta: "تواصل معنا الآن",
      href: "#contact",
      isPopular: true
    }
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden" id="pricing">
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[-10%] w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="text-blue-500 font-bold tracking-wider uppercase text-sm mb-3 block inline-block py-1 px-3 bg-blue-50 dark:bg-blue-500/10 rounded-full">الأسعار</span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6">
            خطة أسعار تناسب طموحك
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
            وفر وقتك وجهدك وابدأ في إدارة منصتك بكل بساطة.
          </p>
        </motion.div>

        <div className="max-w-xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ y: -5 }}
              className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 transition-all duration-300 border border-blue-500 dark:border-blue-500/50 shadow-2xl shadow-blue-500/20"
            >
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
                <div className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  الباقة الموصى بها
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center">{plan.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 text-sm text-center">{plan.desc}</p>
              
              <div className="mb-10 flex items-baseline justify-center gap-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{plan.price}</span>
              </div>

              <ul className="space-y-4 mb-10 max-w-sm mx-auto">
                {plan.features.map((feature, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400">
                      <Check className="w-3.5 h-3.5 font-black" />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{feature}</span>
                  </motion.li>
                ))}
              </ul>
              
              <Link
                href={plan.href}
                className="block w-full py-4 px-6 rounded-2xl font-bold text-center transition-all active:scale-95 bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25"
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
