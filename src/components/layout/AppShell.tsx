
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Home, Users, CalendarDays, Stethoscope, DollarSign, Settings, UserCircle, LayoutDashboard, Files, ClipboardList, MessageCircle, LogOut } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarInset,
} from '@/components/ui/sidebar'; // Assuming sidebar.tsx is in ui
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/Logo';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: string;
  children?: NavItem[];
};

interface AppShellProps {
  children: ReactNode;
  navItems: NavItem[];
  userRole: 'Doctor' | 'Staff' | 'Patient';
  userName: string;
  userEmail: string;
}

export function AppShell({ children, navItems, userRole, userName, userEmail }: AppShellProps) {
  const profileLink = userRole === 'Doctor' ? '/doctor/profile' : '/staff/profile';
  // Add '/patient/profile' if/when Patient portal uses AppShell

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/" className="mb-2">
            <Logo className="h-10 w-auto" />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton tooltip={item.label}>
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                  </SidebarMenuButton>
                </Link>
                {/* Add sub-menu rendering if needed based on item.children */}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          {/* Placeholder for theme toggle or user settings */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
          <SidebarTrigger className="md:hidden" /> {/* Only show trigger on mobile if sidebar is collapsible */}
          <div className="flex-1">
            {/* Breadcrumbs or page title can go here */}
            <h1 className="text-xl font-semibold">{userRole} Portal</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={`https://placehold.co/100x100.png?text=${userName.charAt(0)}`} alt={userName} data-ai-hint="avatar person" />
                  <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href={profileLink} passHref>
                <DropdownMenuItem>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href={profileLink} passHref> {/* Settings can also go to profile for simplicity */}
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link href="/login" passHref>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Define navigation items for different roles
export const doctorNavItems: NavItem[] = [
  { href: '/doctor/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
  { href: '/doctor/patients', label: 'Patients', icon: <Users /> },
  { href: '/doctor/appointments', label: 'Appointments', icon: <CalendarDays /> },
  { href: '/doctor/profile', label: 'Profile', icon: <UserCircle /> },
];

export const staffNavItems: NavItem[] = [
  { href: '/staff/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
  { href: '/staff/appointments', label: 'Scheduling', icon: <CalendarDays /> },
  { href: '/staff/patients', label: 'Patient Records', icon: <Users /> },
  { href: '/staff/payments', label: 'Billing', icon: <DollarSign /> },
  { href: '/staff/communication', label: 'Messages', icon: <MessageCircle /> , badge: '3' },
  { href: '/staff/profile', label: 'Profile', icon: <UserCircle /> },
];
