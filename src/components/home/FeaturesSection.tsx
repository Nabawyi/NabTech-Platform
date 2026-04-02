import { Users, MonitorPlay, FileCheck, CalendarCheck, CreditCard, MessageSquare } from 'lucide-react';

const features = [
  {
    id: 1,
    title: 'إدارة الطلاب',
    description: 'تحكم كامل في قاعدة بيانات طلابك، ومتابعة دقيقة لكل طالب بكل سهولة.',
    icon: Users,
  },
  {
    id: 2,
    title: 'إضافة الدروس',
    description: 'ارفع فيديوهات مسجلة، مذكرات PDF، ومحتوى تفاعلي منظم حسب الصفوف.',
    icon: MonitorPlay,
  },
  {
    id: 3,
    title: 'كويزات واختبارات',
    description: 'تكوين اختبارات تفاعلية لتقييم الطلاب آلياً ومتابعة مستوياتهم بصورة دورية.',
    icon: FileCheck,
  },
  {
    id: 4,
    title: 'متابعة الحضور',
    description: 'تسجيل ومتابعة حضور الطلاب في مجموعاتك وتتبع التزامهم بضغطة زر.',
    icon: CalendarCheck,
  },
  {
    id: 5,
    title: 'نظام اشتراكات',
    description: 'إدارة الاشتراكات الشهرية، فواتير الطلاب، وتنبيهات الدفع ومواعيد الانتهاء تلقائياً.',
    icon: CreditCard,
  },
  {
    id: 6,
    title: 'تواصل واتساب',
    description: 'روابط مباشرة وقوالب جاهزة للتواصل السريع مع الطلاب وأولياء الأمور عبر الواتساب.',
    icon: MessageSquare,
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-gray-50/50" id="features">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-red-500 font-bold tracking-wider uppercase text-sm mb-2 block">المميزات</span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-6">
            كل الأدوات التي تحتاجها للنجاح
          </h2>
          <p className="text-gray-500 text-lg font-medium">
            صممنا NabTech بأحدث التقنيات لنوفر لك بيئة عمل تغنيك عن المنصات المعقدة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div 
                key={feature.id} 
                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-slate-50 text-slate-800 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
