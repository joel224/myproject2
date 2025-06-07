
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PhoneCall, CalendarPlus, Video, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const actions = [
  {
    icon: <PhoneCall className="h-8 w-8 text-destructive" />,
    title: 'Emergency',
    description: 'Toothache? Tap Here!',
    href: 'tel:+1234567890', // Example phone number
    buttonText: 'Call Now',
    variant: 'destructive' as const,
  },
  {
    icon: <CalendarPlus className="h-8 w-8 text-primary" />,
    title: 'Book Appointment',
    description: 'Schedule your visit easily.',
    href: '/#appointment', // Link to booking section or page
    buttonText: 'Book Now',
    variant: 'default' as const,
  },
  {
    icon: <Video className="h-8 w-8 text-primary" />,
    title: 'Virtual Consultation',
    description: 'Meet our dentists online.',
    href: '/virtual-consultation', // Placeholder link
    buttonText: 'Start Video Call',
    variant: 'outline' as const,
  },
  {
    icon: <LogIn className="h-8 w-8 text-primary" />,
    title: 'Patient Login',
    description: 'Access records & payments.',
    href: '/login', // Link to patient login page
    buttonText: 'Login',
    variant: 'outline' as const,
  },
];

export function QuickActionsGrid() {
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
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section
      id="quick-actions"
      ref={sectionRef}
      className={cn(
        "w-full py-12 md:py-16 lg:py-20 bg-background",
        "initial-fade-in-up",
        isVisible && "is-visible"
      )}
    >
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action, index) => (
            <Card
              key={action.title}
              className={cn(
                "flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1",
                "initial-fade-in-up", // Apply to each card for potential stagger
                isVisible && "is-visible"
              )}
              style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }} // Stagger effect
            >
              <CardHeader className="items-center">
                {action.icon}
                <CardTitle className="mt-4">{action.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow items-center">
                <CardDescription className="mb-4 flex-grow">{action.description}</CardDescription>
                <Link href={action.href} className="w-full mt-auto">
                  <Button variant={action.variant} className="w-full">
                    {action.buttonText}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
