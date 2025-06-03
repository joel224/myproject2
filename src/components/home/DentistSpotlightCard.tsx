'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';

export function DentistSpotlightCard() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !titleRef.current || !descriptionRef.current) {
        return;
      }

      const { top, height } = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Only apply effect if the section is somewhat in the viewport
      if (top < windowHeight && top + height > 0) {
        // Calculate a value representing the section's center relative to the viewport center.
        // This value is 0 when the section's center aligns with the viewport's center.
        // Negative if the section's center is above viewport center, positive if below.
        const centerOffset = top + height / 2 - windowHeight / 2;

        // Apply a subtle parallax shift. The further from center, the more the shift.
        // We use a negative factor to make the text elements move slightly against the scroll direction.
        const titleShift = centerOffset * -0.05; 
        const descriptionShift = centerOffset * -0.03;

        titleRef.current.style.transform = `translateY(${titleShift}px)`;
        descriptionRef.current.style.transform = `translateY(${descriptionShift}px)`;
      } else {
        // Reset transform when section is out of view to prevent large translate values
        titleRef.current.style.transform = 'translateY(0px)';
        descriptionRef.current.style.transform = 'translateY(0px)';
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Call once on mount to set initial position if in view

    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Ensure styles are reset if component unmounts while transformed
      if (titleRef.current) titleRef.current.style.transform = 'translateY(0px)';
      if (descriptionRef.current) descriptionRef.current.style.transform = 'translateY(0px)';
    };
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <section 
      id="team" 
      ref={sectionRef}
      className="w-full py-12 md:py-16 lg:py-20" 
      // Removed previous background parallax styles
    >
      {/* Overlay div removed */}
      
      <div className="container px-4 md:px-6 flex flex-col items-center relative z-10">
        <h2 
          ref={titleRef}
          className="text-3xl font-bold tracking-tight text-center mb-2 text-primary" // Reverted text color
          style={{ transition: 'transform 75ms linear' }} // Smooth transition for transform
        >
          Meet Our Lead Dentist
        </h2>
        <p 
          ref={descriptionRef}
          className="text-muted-foreground text-center mb-10 max-w-xl" // Reverted text color
          style={{ transition: 'transform 75ms linear' }} // Smooth transition
        >
            Dedicated to providing the highest quality care with a gentle touch.
        </p>
        <Card className="w-full max-w-md shadow-xl overflow-hidden bg-card"> {/* Reverted card background */}
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
              <Button variant="outline" className="bg-card hover:bg-card/90">Meet the Full Team</Button> {/* Reverted button style */}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
