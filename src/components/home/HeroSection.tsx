import { Button } from '@/components/ui/button';
import { SmilingToothIcon } from '@/components/icons/SmilingToothIcon';
import Link from 'next/link';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-primary/10 via-background to-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="font-manrope text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-primary">
              Your Smile, Our Passion!
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl lg:mx-0 mx-auto">
              Experience exceptional dental care at Dr. Loji's Dental Hub. We're dedicated to creating healthy, beautiful smiles for life.
            </p>
            <div className="flex flex-col items-center lg:items-start space-y-4">
              <Link href="/#appointment">
                <Button 
                  size="lg" 
                  className="px-8 py-6 text-lg shadow-lg bg-medicalAccent text-medicalAccent-foreground hover:bg-medicalAccent/90 transition-shadow"
                >
                  Book an Appointment in 30 Seconds
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <Image
              src="https://placehold.co/600x400.png"
              alt="Happy patient smiling"
              width={600}
              height={400}
              className="rounded-xl shadow-2xl object-cover"
              data-ai-hint="dental clinic patient"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
