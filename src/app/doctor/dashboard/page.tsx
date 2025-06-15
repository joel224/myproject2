
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Appointment } from "@/lib/types"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, PlusCircle, Search, Loader2, AlertTriangle, CalendarDays, ListChecks } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast'; 
import { mockPatients } from "@/lib/mockData"; 

const MOCK_DOCTOR_ID = "doc1";

export default function DoctorDashboardPage() {
  const { toast } = useToast();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [isLoadingPendingTasks, setIsLoadingPendingTasks] = useState(true);
  const [pendingTasksError, setPendingTasksError] = useState<string | null>(null);

  const recentPatients = mockPatients.slice(0,3); 

  const fetchUpcomingAppointments = useCallback(async () => {
    setIsLoadingAppointments(true);
    setAppointmentsError(null);
    try {
      const response = await fetch(`/api/appointments?doctorId=${MOCK_DOCTOR_ID}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch appointments');
      }
      let data: Appointment[] = await response.json();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filteredAndSorted = data
        .filter(apt => {
          const aptDate = new Date(apt.date);
          aptDate.setHours(0,0,0,0);
          return aptDate >= today && apt.status !== 'Completed' && apt.status !== 'Cancelled';
        })
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (dateA !== dateB) return dateA - dateB;
          const parseTime = (timeStr: string) => {
            const [time, modifier] = timeStr.split(' ');
            if (!time || !modifier) return 0;
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0; 
            return hours * 60 + minutes;
          };
          return parseTime(a.time) - parseTime(b.time);
        })
        .slice(0, 5); 

      setUpcomingAppointments(filteredAndSorted);
    } catch (error: any) {
      setAppointmentsError(error.message || "Could not load upcoming appointments.");
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not load upcoming appointments." });
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [toast]);

  const fetchPendingTasks = useCallback(async () => {
    setIsLoadingPendingTasks(true);
    setPendingTasksError(null);
    try {
      const response = await fetch(`/api/appointments?doctorId=${MOCK_DOCTOR_ID}&status=Scheduled`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch pending tasks');
      }
      const data: Appointment[] = await response.json();
      setPendingTasksCount(data.length);
    } catch (error: any) {
      setPendingTasksError(error.message || "Could not load pending tasks.");
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not load pending tasks count." });
    } finally {
      setIsLoadingPendingTasks(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUpcomingAppointments();
    fetchPendingTasks();
  }, [fetchUpcomingAppointments, fetchPendingTasks]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Doctor Dashboard</h1>
        <Link href="/doctor/patients/new"> 
          <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Patient</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>A quick look at your next few appointments.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingAppointments ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading appointments...</p>
            </div>
          ) : appointmentsError ? (
             <div className="flex flex-col items-center justify-center p-4 text-destructive">
              <AlertTriangle className="h-8 w-8 mb-2" />
              <p>{appointmentsError}</p>
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingAppointments.map(apt => (
                  <TableRow key={apt.id}>
                    <TableCell>{apt.patientName || 'N/A'}</TableCell>
                    <TableCell>{new Date(apt.date).toLocaleDateString()} - {apt.time}</TableCell>
                    <TableCell>{apt.type}</TableCell>
                    <TableCell><Badge variant={apt.status === 'Confirmed' ? 'default' : 'secondary'}>{apt.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Link href={`/doctor/patients/${apt.patientId}?appointment=${apt.id}`}>
                        <Button variant="outline" size="sm">View Details <ArrowRight className="ml-2 h-4 w-4"/></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No upcoming appointments scheduled.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Patient Search</CardTitle>
          <CardDescription>Quickly find a patient record.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input type="text" placeholder="Search by name or ID..." className="flex-1" />
            <Button type="submit"><Search className="mr-2 h-4 w-4" /> Search</Button>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Recently Viewed Patients:</h3>
            {recentPatients.length > 0 ? (
              <ul className="space-y-1">
                {recentPatients.map(p => (
                  <li key={p.id}>
                    <Link href={`/doctor/patients/${p.id}`} className="text-primary hover:underline">{p.name}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recently viewed patients.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingAppointments ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : appointmentsError ? (
                <span className="text-destructive text-sm">Error</span>
            ) : (
                <p className="text-4xl font-bold">{upcomingAppointments.length}</p>
            )}
             <p className="text-xs text-muted-foreground">
                In the next few days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingPendingTasks ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : pendingTasksError ? (
              <span className="text-destructive text-sm">Error</span>
            ) : (
              <p className="text-4xl font-bold">{pendingTasksCount}</p>
            )}
             <p className="text-xs text-muted-foreground">
                Appointments to Confirm or Review
            </p>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
