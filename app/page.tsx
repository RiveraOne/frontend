import HeroSection from "@/components/landing/hero-section";
import TickerMarquee from "@/components/landing/ticker-marquee";
import FeaturesSection from "@/components/landing/features-section";
import SocialProof from "@/components/landing/social-proof";
import HowItWorks from "@/components/landing/how-it-works";
import PricingPreview from "@/components/landing/pricing-preview";
import FAQSection from "@/components/landing/faq-section";
import CTASection from "@/components/landing/cta-section";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      <TickerMarquee />
      <FeaturesSection />
      <SocialProof />
      <HowItWorks />
      <PricingPreview />
      <FAQSection />
      <CTASection />
    </main>
  );
}
