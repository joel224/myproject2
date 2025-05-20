import { AppShell, staffNavItems } from '@/components/layout/AppShell';
import type { ReactNode } from 'react';

export default function StaffLayout({ children }: { children: ReactNode }) {
  // In a real app, user data would come from auth context
  const userName = "Sarah ClinicStaff";
  const userEmail = "sarah.staff@dentalhub.com";

  return (
    <AppShell 
      navItems={staffNavItems}
      userRole="Staff"
      userName={userName}
      userEmail={userEmail}
    >
      {children}
    </AppShell>
  );
}
