// src/components/home/BookingPopupDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface BookingPopupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
}

const MOCK_CITIES = ["Smileville", "Tooth City", "Dentalburg", "Metropolis"];
const MOCK_CLINIC_PHONE = "+1234567890"; 

export function BookingPopupDialog({ isOpen, onClose, onOpenChange }: BookingPopupDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!phoneNumber.trim() || !selectedCity) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter your phone number and select a city.',
      });
      return;
    }
    console.log('Booking request:', { phoneNumber, selectedCity });
    toast({
      title: 'Request Submitted (Mock)',
      description: `We'll contact you at ${phoneNumber} regarding services in ${selectedCity}.`,
    });
    onClose(); 
  };

  useEffect(() => {
    // Reset form fields when the dialog is closed
    if (!isOpen) {
      setPhoneNumber('');
      setSelectedCity('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="flex flex-col">
          {/* Top: Image (Visible on all screen sizes) */}
          <div className="relative w-full h-48">
            <Image
              src="https://drive.google.com/uc?export=download&id=10HnjuMf4QBKmklhRdTvGKfcN5yrxo1G9"
              alt="Smiling patient receiving dental care"
              layout="fill"
              objectFit="cover"
              className="rounded-t-lg"
              data-ai-hint="dental patient smile"
              priority 
            />
          </div>

          {/* Bottom: Form Content */}
          <div className="p-6 flex flex-col justify-center space-y-4">
            <DialogHeader className="text-center">
              <DialogTitle className="text-2xl text-primary">Bring out your smile!</DialogTitle>
              <DialogDescription className="pt-2">
                Ready for a consultation? Enter your details below or call us directly.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="popup-phone" className="text-left">
                  Phone
                </Label>
                <Input
                  id="popup-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(123) 456-7890"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="popup-city" className="text-left">
                  City
                </Label>
                <Select value={selectedCity} onValueChange={setSelectedCity} required>
                  <SelectTrigger id="popup-city">
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex-col gap-3 pt-2">
              <Button type="button" onClick={handleSubmit} className="w-full">
                Request Callback
              </Button>
              <a href={`tel:${MOCK_CLINIC_PHONE}`} aria-label="Call us directly" className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full border-accent text-accent hover:bg-accent/10"
                  type="button"
                >
                  <Phone className="mr-2 h-4 w-4" /> Call Us Now
                </Button>
              </a>
              <Button variant="ghost" onClick={onClose} className="w-full">
                Maybe Later
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
