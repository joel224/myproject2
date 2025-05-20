import { MainNavbar } from '@/components/layout/MainNavbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { QuickActionsGrid } from '@/components/home/QuickActionsGrid';
import { DentistSpotlightCard } from '@/components/home/DentistSpotlightCard';
import { SmileGallerySection } from '@/components/home/SmileGallerySection';
import { WaitTimeWidget } from '@/components/home/WaitTimeWidget';
import { HealthTipCard } from '@/components/home/HealthTipCard';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

// Placeholder for appointment booking section
function AppointmentBookingSection() {
  return (
    <section id="appointment" className="w-full py-12 md:py-16 lg:py-20 bg-primary/5">
      <div className="container px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4 text-primary">Book Your Appointment</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Ready to take the next step towards a healthier smile? Booking is quick and easy!
        </p>
        <Card className="max-w-lg mx-auto text-left shadow-lg">
          <CardHeader>
            <CardTitle>Schedule Your Visit</CardTitle>
            <CardDescription>Fill out the form below or call us directly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Simplified form placeholder */}
            <div><label htmlFor="name" className="block text-sm font-medium text-foreground">Full Name</label><input type="text" id="name" className="mt-1 block w-full rounded-md border-input shadow-sm p-2" placeholder="Your Name" /></div>
            <div><label htmlFor="phone" className="block text-sm font-medium text-foreground">Phone Number</label><input type="tel" id="phone" className="mt-1 block w-full rounded-md border-input shadow-sm p-2" placeholder="Your Phone" /></div>
            <div><label htmlFor="service" className="block text-sm font-medium text-foreground">Service Needed</label><select id="service" className="mt-1 block w-full rounded-md border-input shadow-sm p-2 bg-background"><option>General Checkup</option><option>Cleaning</option><option>Whitening</option><option>Other</option></select></div>
            <Button type="submit" className="w-full" size="lg">Request Appointment</Button>
            <p className="text-sm text-muted-foreground text-center">Or call us at <a href="tel:+1234567890" className="text-primary hover:underline">(123) 456-7890</a></p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// Placeholder for services section
function ServicesSection() {
  const services = [
    "General Dentistry", "Cosmetic Dentistry", "Orthodontics", 
    "Pediatric Dentistry", "Dental Implants", "Emergency Care"
  ];
  return (
    <section id="services" className="w-full py-12 md:py-16 lg:py-20 bg-background">
      <div className="container px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4 text-primary">Our Services</h2>
        <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
          Comprehensive dental solutions tailored to your needs.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <Card key={service} className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-accent" />
                <h3 className="text-lg font-semibold text-foreground">{service}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNavbar />
      <main className="flex-grow">
        <HeroSection />
        <QuickActionsGrid />
        <Separator className="my-8 md:my-12" />
        <ServicesSection />
        <Separator className="my-8 md:my-12" />
        <DentistSpotlightCard />
        <Separator className="my-8 md:my-12" />
        <SmileGallerySection />
        <Separator className="my-8 md:my-12" />
        <WaitTimeWidget />
        <Separator className="my-8 md:my-12" />
        <HealthTipCard />
        <Separator className="my-8 md:my-12" />
        <AppointmentBookingSection />
      </main>
      <Footer />
    </div>
  );
}
