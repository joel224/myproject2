
// src/components/home/ServicesSection.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Gem, Settings, Users, Zap } from 'lucide-react'; // Example icons
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const services = [
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'General Dentistry',
    description: 'Routine check-ups, cleanings, fillings, and more for overall oral health.',
  },
  {
    icon: <Gem className="h-8 w-8 text-primary" />,
    title: 'Cosmetic Dentistry',
    description: 'Enhance your smile with teeth whitening, veneers, and cosmetic bonding.',
  },
  {
    icon: <Settings className="h-8 w-8 text-primary" />, // Placeholder, could be braces icon
    title: 'Orthodontics',
    description: 'Straighten your teeth and correct bite issues with braces or clear aligners.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />, // Placeholder, could be child icon
    title: 'Pediatric Dentistry',
    description: 'Gentle and specialized dental care for children of all ages.',
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />, // Placeholder, could be implant icon
    title: 'Dental Implants',
    description: 'Permanent solutions for missing teeth, restoring function and aesthetics.',
  },
  {
    icon: <Zap className="h-8 w-8 text-destructive" />, // Changed icon for emergency
    title: 'Emergency Care',
    description: 'Prompt treatment for dental emergencies like toothaches or injuries.',
  },
];

export function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className={cn(
        "w-full py-12 md:py-16 lg:py-20 bg-background",
        "initial-fade-in-up",
        isVisible && "is-visible"
      )}
    >
      <div className="container px-4 md:px-6">
        <div className={cn("text-center mb-10 md:mb-12 initial-fade-in-up", isVisible && "is-visible")} style={{ transitionDelay: isVisible ? `0ms` : '0ms' }}>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">Our Services</h2>
          <p className="mt-3 text-muted-foreground md:text-lg max-w-xl mx-auto">
            Comprehensive dental solutions tailored to your needs.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Card
              key={service.title}
              className={cn(
                "flex flex-col text-center shadow-md hover:shadow-lg transition-shadow duration-200",
                "initial-fade-in-up",
                isVisible && "is-visible"
              )}
              style={{ transitionDelay: isVisible ? `${100 + index * 100}ms` : '0ms' }}
            >
              <CardHeader className="items-center">
                {service.icon}
                <CardTitle className="mt-4">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
