
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function HealthTipCard() {
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

  const tip = "Did You Know? Flossing daily can remove plaque regular brushing misses, significantly improving gum health!";

  return (
    <section
      ref={sectionRef}
      className={cn(
        "w-full py-8 md:py-12 bg-secondary/30",
        "initial-fade-in-up",
        isVisible && "is-visible"
      )}
    >
      <div className="container px-4 md:px-6 flex justify-center">
        <Card className="shadow-lg w-full max-w-2xl">
          <CardHeader className="flex flex-row items-center space-x-3 space-y-0 pb-2">
            <Lightbulb className="h-6 w-6 text-accent" />
            <CardTitle className="text-lg font-semibold text-accent-foreground">Oral Health Tip of the Day</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {tip}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
