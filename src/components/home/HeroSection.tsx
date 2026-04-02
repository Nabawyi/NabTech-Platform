import Link from 'next/link';
import { ArrowLeft, PlayCircle } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white min-h-[80vh] flex items-center py-20">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 -z-10 m-auto h-[500px] w-[500px] rounded-full bg-red-500 opacity-[0.07] blur-[150px] pointer-events-none"></div>
      
      <div className="container relative mx-auto px-4 sm:px-6 w-full">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50/50 px-5 py-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <p className="text-sm font-black text-slate-600 tracking-tight">المنصة التعليمية الأقوى في مصر</p>
          </div>
          
          <h1 className="mb-8 text-5xl font-black leading-[1.1] text-slate-900 md:text-6xl lg:text-8xl">
            مستقبلك التعليمي <br className="hidden md:block" /> يبدأ من <span className="text-red-500 inline-block relative">NabTech<span className="absolute bottom-2 left-0 w-full h-3 bg-red-500/10 -z-10"></span></span>
          </h1>
          
          <p className="mb-10 text-xl font-medium text-gray-500 leading-relaxed max-w-2xl mx-auto">
            منصة متكاملة تواكب طموحك. سواء كنت معلماً يبحث عن الاحترافية، أو طالباً يسعى للتفوق، كل ما تحتاجه هنا في مكان واحد.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="#audience" 
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-lg font-black text-white transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-900/20"
            >
              اكتشف المنصة
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
