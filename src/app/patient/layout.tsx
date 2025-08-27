
// src/app/patient/layout.tsx
import type { ReactNode } from 'react';
import { MainNavbar } from '@/components/layout/MainNavbar';
import { Footer } from '@/components/layout/Footer';

// A simple layout for the patient-facing pages that are not part of the main marketing site.
export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <MainNavbar />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
