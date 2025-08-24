
import { MainNavbar } from '@/components/layout/MainNavbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { QuickActionsGrid } from '@/components/home/QuickActionsGrid';
import { ServicesSection } from '@/components/home/ServicesSection'; 
import { DentistSpotlightCard } from '@/components/home/DentistSpotlightCard';
import { SmileGallerySection } from '@/components/home/SmileGallerySection';

import { HealthTipCard } from '@/components/home/HealthTipCard';
import { Separator } from '@/components/ui/separator';
import { AppointmentBookingSection } from '@/components/home/AppointmentBookingSection';


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNavbar />
      <main className="flex-grow">
        <HeroSection />
        <QuickActionsGrid />
        <Separator className="my-8 md:my-12" />
        <DentistSpotlightCard />
        <Separator className="my-8 md:my-12" />
        <SmileGallerySection />
        <Separator className="my-8 md:my-12" />
        <ServicesSection /> 
        <Separator className="my-8 md:my-12" />
        <HealthTipCard />
        <Separator className="my-8 md:my-12" />
        <AppointmentBookingSection />
      </main>
      <Footer />
    </div>
  );
}
