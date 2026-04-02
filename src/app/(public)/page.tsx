import HeroSection from '@/components/home/HeroSection';
import AudienceSection from '@/components/home/AudienceSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import BenefitsSection from '@/components/home/BenefitsSection';
import PricingSection from '@/components/home/PricingSection';
import ContactSection from '@/components/home/ContactSection';
import CTASection from '@/components/home/CTASection';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <AudienceSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <PricingSection />
      <ContactSection />
      <CTASection />
    </div>
  );
}
