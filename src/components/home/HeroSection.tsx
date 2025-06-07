
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function HeroSection() {
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [textVisible, setTextVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1, // Trigger when 10% of the element is visible
    };

    const textObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTextVisible(true);
          textObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setImageVisible(true);
          imageObserver.unobserve(entry.target);
        }
      });
    }, {...observerOptions, threshold: 0.2}); // Image might need more visibility to trigger

    if (textRef.current) {
      textObserver.observe(textRef.current);
    }
    if (imageRef.current) {
      imageObserver.observe(imageRef.current);
    }

    return () => {
      if (textRef.current) textObserver.unobserve(textRef.current);
      if (imageRef.current) imageObserver.unobserve(imageRef.current);
    };
  }, []);

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-primary/10 via-background to-background overflow-x-hidden">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
          <div
            ref={textRef}
            className={cn(
              "space-y-6 text-center lg:text-left",
              "initial-fade-in-left",
              textVisible && "is-visible"
            )}
          >
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
          <div
            ref={imageRef}
            className={cn(
              "flex justify-center items-center",
              "initial-fade-in-right",
              imageVisible && "is-visible"
            )}
          >
            <Image
              src="https://placehold.co/600x400.png"
              alt="Happy patient smiling"
              width={600}
              height={400}
              className="rounded-xl shadow-2xl object-cover"
              data-ai-hint="dental clinic patient"
              priority // Good for LCP
            />
          </div>
        </div>
      </div>
    </section>
  );
}
