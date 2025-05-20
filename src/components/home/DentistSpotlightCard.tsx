import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

export function DentistSpotlightCard() {
  return (
    <section id="team" className="w-full py-12 md:py-16 lg:py-20 bg-secondary/30">
      <div className="container px-4 md:px-6 flex flex-col items-center">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-2 text-primary">Meet Our Lead Dentist</h2>
        <p className="text-muted-foreground text-center mb-10 max-w-xl">
            Dedicated to providing the highest quality care with a gentle touch.
        </p>
        <Card className="w-full max-w-md shadow-xl overflow-hidden">
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
            <CardDescription className="mt-2 text-muted-foreground">
              15+ Years of Smile Magic. Passionate about transformative dental care and patient well-being.
            </CardDescription>
          </CardContent>
          <CardFooter className="p-6 pt-0 flex justify-center">
            <Link href="/team">
              <Button variant="outline">Meet the Full Team</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
