
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentSectionRef = sectionRef.current;
    if (currentSectionRef) {
      observer.observe(currentSectionRef);
    }

    return () => {
      if (currentSectionRef) {
        observer.unobserve(currentSectionRef);
      }
    };
  }, []);

  const services = [
    "General Dentistry", "Cosmetic Dentistry", "Orthodontics",
    "Pediatric Dentistry", "Dental Implants", "Emergency Care"
  ];

  return (
    <section id="services" ref={sectionRef} className="w-full py-12 md:py-16 lg:py-20 bg-background">
      <div className="container px-4 md:px-6 text-center">
        <div
          className={cn("mb-10", "initial-fade-in-up", isVisible && "is-visible")}
        >
          <h2 ref={titleRef} className="text-3xl font-bold tracking-tight mb-4 text-primary">Our Services</h2>
          <p ref={descriptionRef} className="text-muted-foreground max-w-xl mx-auto">
            Comprehensive dental solutions tailored to your needs.
          </p>
        </div>
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service, index) => (
            <Card
              key={service}
              className={cn(
                "shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1",
                "initial-fade-in-up",
                isVisible && "is-visible"
              )}
              style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
            >
              <CardContent className="p-6 flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-medicalAccent" />
                <h3 className="text-lg font-semibold text-foreground">{service}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
