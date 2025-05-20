import { AppShell, doctorNavItems } from '@/components/layout/AppShell';
import type { ReactNode } from 'react';

export default function DoctorLayout({ children }: { children: ReactNode }) {
  // In a real app, user data would come from auth context
  const userName = "Dr. Loji";
  const userEmail = "dr.loji@dentalhub.com";

  return (
    <AppShell 
      navItems={doctorNavItems}
      userRole="Doctor"
      userName={userName}
      userEmail={userEmail}
    >
      {children}
    </AppShell>
  );
}
