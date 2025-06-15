
// src/app/doctor/patients/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search, Eye, Loader2, AlertTriangle, Edit3 } from "lucide-react";
import Link from "next/link";
import type { Patient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function DoctorPatientsListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/patients');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch patients');
        }
        const data: Patient[] = await response.json();
        setPatients(data);
      } catch (err: any) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error fetching patients",
          description: err.message,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, [toast]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone && patient.phone.includes(searchTerm)) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Patient Records</h1>
        <Link href="/doctor/patients/new">
            <Button><PlusCircle className="mr-2 h-4 w-4"/>Add New Patient</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Patients</CardTitle>
           <CardDescription>Browse, view, and manage patient records from the central clinic database.</CardDescription>
          <div className="flex w-full max-w-md items-center space-x-2 mt-2">
            <Input
              type="text"
              placeholder="Search by name, email, phone, or ID..."
              className="flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="button"><Search className="mr-2 h-4 w-4" /> Search</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading patient records...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-destructive">
              <AlertTriangle className="h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length > 0 ? filteredPatients.map(patient => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                       <Link href={`/doctor/patients/${patient.id}`} className="hover:underline text-primary">
                        {patient.name}
                      </Link>
                    </TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.phone || 'N/A'}</TableCell>
                    <TableCell>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Link href={`/doctor/patients/${patient.id}`}>
                          <Button variant="outline" size="sm" aria-label="View Patient Record"><Eye className="mr-1 h-4 w-4"/>View</Button>
                      </Link>
                       <Link href={`/doctor/patients/${patient.id}/edit`}>
                          <Button variant="ghost" size="icon" aria-label="Edit Patient Record"><Edit3 className="h-4 w-4"/></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                      No patients found{searchTerm ? ' matching your search' : ''}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
