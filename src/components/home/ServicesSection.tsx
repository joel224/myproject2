'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export function ServicesSection() {
  const services = [
    "General Dentistry", "Cosmetic Dentistry", "Orthodontics", 
    "Pediatric Dentistry", "Dental Implants", "Emergency Care"
  ];
  return (
    <section id="services" className="w-full py-12 md:py-16 lg:py-20 bg-background">
      <div className="container px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4 text-primary">Our Services</h2>
        <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
          Comprehensive dental solutions tailored to your needs.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <Card key={service} className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-accent" />
                <h3 className="text-lg font-semibold text-foreground">{service}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
