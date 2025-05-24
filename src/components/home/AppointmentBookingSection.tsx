'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AppointmentBookingSection() {
  return (
    <section id="appointment" className="w-full py-12 md:py-16 lg:py-20 bg-primary/5">
      <div className="container px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4 text-primary">Book Your Appointment</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Ready to take the next step towards a healthier smile? Booking is quick and easy!
        </p>
        <Card className="max-w-lg mx-auto text-left shadow-lg">
          <CardHeader>
            <CardTitle>Schedule Your Visit</CardTitle>
            <CardDescription>Fill out the form below or call us directly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Simplified form placeholder */}
            <div><label htmlFor="name" className="block text-sm font-medium text-foreground">Full Name</label><input type="text" id="name" className="mt-1 block w-full rounded-md border-input shadow-sm p-2" placeholder="Your Name" /></div>
            <div><label htmlFor="phone" className="block text-sm font-medium text-foreground">Phone Number</label><input type="tel" id="phone" className="mt-1 block w-full rounded-md border-input shadow-sm p-2" placeholder="Your Phone" /></div>
            <div><label htmlFor="service" className="block text-sm font-medium text-foreground">Service Needed</label><select id="service" className="mt-1 block w-full rounded-md border-input shadow-sm p-2 bg-background"><option>General Checkup</option><option>Cleaning</option><option>Whitening</option><option>Other</option></select></div>
            <Button type="submit" className="w-full" size="lg">Request Appointment</Button>
            <p className="text-sm text-muted-foreground text-center">Or call us at <a href="tel:+1234567890" className="text-primary hover:underline">(123) 456-7890</a></p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
