
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function DentistSpotlightCard() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCardVisible, setIsCardVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !titleRef.current || !descriptionRef.current) {
        return;
      }

      const { top, height } = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (top < windowHeight && top + height > 0) {
        const centerOffset = top + height / 2 - windowHeight / 2;
        const titleShift = centerOffset * -0.05; 
        const descriptionShift = centerOffset * -0.03;

        titleRef.current.style.transform = `translateY(${titleShift}px)`;
        descriptionRef.current.style.transform = `translateY(${descriptionShift}px)`;
      } else {
        titleRef.current.style.transform = 'translateY(0px)';
        descriptionRef.current.style.transform = 'translateY(0px)';
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (titleRef.current) titleRef.current.style.transform = 'translateY(0px)';
      if (descriptionRef.current) descriptionRef.current.style.transform = 'translateY(0px)';
    };
  }, []);

  useEffect(() => {
    const cardElement = cardRef.current;
    if (!cardElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsCardVisible(true);
            observer.unobserve(cardElement); // Animate only once
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% of the card is visible
    );

    observer.observe(cardElement);

    return () => {
      if (cardElement) {
        observer.unobserve(cardElement);
      }
    };
  }, []);

  return (
    <section 
      id="team" 
      ref={sectionRef}
      className="w-full py-12 md:py-16 lg:py-20 overflow-hidden" 
    >
      <div className="container px-4 md:px-6 flex flex-col items-center relative z-10">
        <h2 
          ref={titleRef}
          className={cn(
            "text-3xl sm:text-4xl font-bold tracking-tight text-center mb-2 text-primary",
            "initial-fade-in-up",
            isCardVisible && "is-visible" 
          )}
          style={{ transition: 'transform 75ms linear', transitionDelay: isCardVisible ? `0ms` : '0ms' }}
        >
          Meet Our Lead Dentist
        </h2>
        <p 
          ref={descriptionRef}
          className={cn(
            "text-muted-foreground md:text-lg text-center mb-10 max-w-xl",
            "initial-fade-in-up",
            isCardVisible && "is-visible"
          )}
          style={{ transition: 'transform 75ms linear', transitionDelay: isCardVisible ? `100ms` : '0ms' }}
        >
            Dedicated to providing the highest quality care with a gentle touch.
        </p>
        <Card 
          ref={cardRef}
          className={`w-full max-w-md shadow-xl overflow-hidden bg-card
            transition-all duration-700 ease-out
            ${isCardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
           style={{ transitionDelay: isCardVisible ? `200ms` : '0ms' }}
        >
          <CardHeader className="p-0">
            <Image
              src="https://drive.google.com/uc?id=18aD-AVHaGk9vR5OhDtS15IwSVPwDGmUF"
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
              <Button variant="outline" className="bg-card hover:bg-card/90">Meet the Full Team</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
