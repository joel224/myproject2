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
import { cn } from '@/lib/utils';

interface BookingPopupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
}

const MOCK_CITIES = ["Smileville", "Tooth City", "Dentalburg", "Metropolis"];
const MOCK_CLINIC_PHONE = "+1234567890"; // Placeholder - Replace with actual number

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
    // In a real app, you would send this data to your backend
    console.log('Booking request:', { phoneNumber, selectedCity });
    toast({
      title: 'Request Submitted (Mock)',
      description: `We'll contact you at ${phoneNumber} regarding services in ${selectedCity}.`,
    });
    onClose(); // Close the dialog after submission
  };

  // Reset form when dialog opens or closes to ensure clean state
  useEffect(() => {
    if (!isOpen) {
      setPhoneNumber('');
      setSelectedCity('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center text-primary">Bring out your smile!</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Ready for a consultation? Enter your details below or call us directly.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="popup-phone" className="text-right col-span-1">
              Phone
            </Label>
            <Input
              id="popup-phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="(123) 456-7890"
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="popup-city" className="text-right col-span-1">
              City
            </Label>
            <Select value={selectedCity} onValueChange={setSelectedCity} required>
              <SelectTrigger id="popup-city" className="col-span-3">
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
        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2 pt-2">
           <a href={`tel:${MOCK_CLINIC_PHONE}`} aria-label="Call us directly" className="w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="w-full border-accent text-accent hover:bg-accent/10"
              type="button"
            >
              <Phone className="mr-2 h-4 w-4" /> Call Us Now
            </Button>
          </a>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
              Maybe Later
            </Button>
            <Button type="button" onClick={handleSubmit} className="w-full sm:w-auto order-1 sm:order-2">
              Request Callback
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
