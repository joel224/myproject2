
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function HeroSection() {
  const textRef = useRef<HTMLDivElement>(null);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1, 
    };

    const textObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTextVisible(true);
          textObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (textRef.current) {
      textObserver.observe(textRef.current);
    }

    return () => {
      if (textRef.current) textObserver.unobserve(textRef.current);
    };
  }, []);

  const videoId = "1zePIw9tOkxwBULvtQsohAvjcYndtRwBI";
  // Construct the embed URL for Google Drive video with autoplay, mute, loop, and no controls
  const videoSrc = `https://drive.google.com/file/d/${videoId}/preview?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&modestbranding=1&playsinline=1&fs=0&rel=0&vq=hd720`;

  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden min-h-[70vh] md:min-h-[80vh] flex items-center">
      {/* Video Background */}
      <iframe
        src={videoSrc}
        className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none"
        frameBorder="0"
        allow="autoplay; encrypted-media;"
        title="Background video player for Dr. Loji's Dental Hub"
      ></iframe>

      {/* Overlay for text contrast */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-[1]"></div>

      <div className="container px-4 md:px-6 relative z-[2]"> {/* z-index to keep content above video and overlay */}
        <div className="grid gap-6 lg:grid-cols-1 items-center"> {/* Changed to lg:grid-cols-1 for centered content */}
          <div
            ref={textRef}
            className={cn(
              "space-y-6 text-center", // text-center for centered content
              "initial-fade-in-up", // Using fade-in-up for centered content
              textVisible && "is-visible"
            )}
          >
            <h1 className="font-manrope text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-white">
              Your Smile, Our Passion!
            </h1>
            <p className="max-w-[600px] text-neutral-200 md:text-xl mx-auto">
              Experience exceptional dental care at Dr. Loji's Dental Hub. We're dedicated to creating healthy, beautiful smiles for life.
            </p>
            <div className="flex flex-col items-center space-y-4">
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
        </div>
      </div>
    </section>
  );
}
