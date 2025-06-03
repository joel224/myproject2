
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

export function DentistSpotlightCard() {
  return (
    <section 
      id="team" 
      className="w-full py-12 md:py-16 lg:py-20"
      style={{
        backgroundImage: "url('https://placehold.co/1920x1080.png?text=Cozy+Clinic+Background')",
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        position: 'relative' // Needed for the overlay
      }}
    >
      {/* Overlay to maintain warmth and readability */}
      <div 
        className="absolute inset-0 bg-secondary/30 z-0"
        style={{ backgroundColor: 'hsl(var(--secondary) / 0.4)' }} // Using HSL for consistent warm overlay
      ></div>
      
      {/* Content container needs to be on top of the overlay */}
      <div className="container px-4 md:px-6 flex flex-col items-center relative z-10">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-2 text-primary-foreground drop-shadow-sm">Meet Our Lead Dentist</h2>
        <p className="text-primary-foreground/90 text-center mb-10 max-w-xl drop-shadow-sm">
            Dedicated to providing the highest quality care with a gentle touch.
        </p>
        <Card className="w-full max-w-md shadow-xl overflow-hidden bg-card/90 backdrop-blur-sm">
          <CardHeader className="p-0">
            <Image
              src="https://placehold.co/600x400.png"
              alt="Dr. Loji"
              width={600}
              height={400}
              className="object-cover w-full h-64"
              data-ai-hint="dentist portrait"
            />
          </CardHeader>
          <CardContent className="p-6 text-center">
            <CardTitle className="text-2xl text-primary">Dr. Loji</CardTitle>
            <CardDescription className="mt-2 text-card-foreground/90">
              15+ Years of Smile Magic. Passionate about transformative dental care and patient well-being.
            </CardDescription>
          </CardContent>
          <CardFooter className="p-6 pt-0 flex justify-center">
            <Link href="/team">
              <Button variant="outline" className="bg-card/80 hover:bg-card">Meet the Full Team</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
