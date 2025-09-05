// src/app/staff/manage-staff/new/page.tsx
'use client';

import { useState, type FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { StaffMember } from '@/lib/types';

const staffRoles: StaffMember['role'][] = ['Dentist', 'Hygienist', 'Assistant', 'Receptionist', 'Admin'];


function AddNewStaffForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [role, setRole] = useState<StaffMember['role'] | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const roleFromQuery = searchParams.get('role');
    if (roleFromQuery) {
      // Ensure consistent casing, e.g., "doctor" -> "Doctor"
      const capitalizedRole = roleFromQuery.charAt(0).toUpperCase() + roleFromQuery.slice(1).toLowerCase() as StaffMember['role'];
      if (staffRoles.includes(capitalizedRole)) {
        setRole(capitalizedRole);
      } else if (roleFromQuery.toLowerCase() === 'doctor') { // Handle common case
        setRole('Dentist');
      } else if (roleFromQuery.toLowerCase() === 'hygienist') {
        setRole('Hygienist');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      setIsLoading(false);
      return;
    }
    if (!role) {
      setError("Role is required.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add staff member");
      }

      toast({
        title: "Staff Member Added!",
        description: `${data.name} (${data.role}) has been successfully added.`,
      });
      
      setName(''); // Clear form on success
      // Keep role selected if user might add another of the same type, or clear:
      // setRole(''); 
      
      // Optionally, redirect after a short delay or offer to add another
      // setTimeout(() => router.push('/staff/dashboard'), 2000);
      
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error Adding Staff",
        description: err.message || "Could not add staff member. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Staff Member</CardTitle>
          <CardDescription>Enter the details for the new staff and their role in the clinic.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="staff-name">Full Name</Label>
              <Input 
                id="staff-name" 
                placeholder="e.g., Dr. Jane Doe, John Smith" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-describedby="name-error"
              />
              {error && error.includes("Name") && <p id="name-error" className="text-sm text-destructive">{error}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-role">Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as StaffMember['role'])} required>
                <SelectTrigger id="staff-role" aria-describedby="role-error">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {staffRoles.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error && error.includes("Role") && <p id="role-error" className="text-sm text-destructive">{error}</p>}
            </div>
            {error && !error.includes("Name") && !error.includes("Role") && <p className="text-sm font-medium text-destructive">{error}</p>}
            
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
             <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button className="w-full sm:w-auto" type="submit" disabled={isLoading}>
              {isLoading ? 'Adding Staff...' : 'Add Staff Member'}
            </Button>
          </CardFooter>
        </form>
      </Card>
  );
}


export default function AddNewStaffPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div>Loading...</div>}>
        <AddNewStaffForm />
      </Suspense>
    </div>
  )
}
