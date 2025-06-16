
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
  
  const [upcomingAppointmentsSummaryCount, setUpcomingAppointmentsSummaryCount] = useState(0);
  const [isLoadingUpcomingSummary, setIsLoadingUpcomingSummary] = useState(true);
  const [upcomingSummaryError, setUpcomingSummaryError] = useState<string | null>(null);


  const recentPatients = mockPatients.slice(0,3);

  const fetchDashboardAppointmentsData = useCallback(async () => {
    setIsLoadingAppointments(true);
    setAppointmentsError(null);
    setIsLoadingUpcomingSummary(true);
    setUpcomingSummaryError(null);

    try {
      const response = await fetch(`/api/appointments?doctorId=${MOCK_DOCTOR_ID}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch appointments');
      }
      let data: Appointment[] = await response.json();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const parseTime = (timeStr: string) => {
        const [time, modifier] = timeStr.split(' ');
        if (!time || !modifier) return 0;
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };
      
      const upcomingForTable = data
        .filter(apt => {
          const aptDate = new Date(apt.date);
          aptDate.setHours(0,0,0,0);
          return aptDate >= today && apt.status !== 'Completed' && apt.status !== 'Cancelled';
        })
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (dateA !== dateB) return dateA - dateB;
          return parseTime(a.time) - parseTime(b.time);
        })
        .slice(0, 5);
      setUpcomingAppointments(upcomingForTable);
      
      const allUpcomingSummary = data.filter(apt => {
         const aptDate = new Date(apt.date);
         aptDate.setHours(0,0,0,0);
         return aptDate >= today && apt.status !== 'Completed' && apt.status !== 'Cancelled';
      });
      setUpcomingAppointmentsSummaryCount(allUpcomingSummary.length);

    } catch (error: any) {
      const errorMsg = error.message || "Could not load appointments data.";
      setAppointmentsError(errorMsg);
      setUpcomingSummaryError(errorMsg);
      toast({ variant: "destructive", title: "Error", description: errorMsg });
    } finally {
      setIsLoadingAppointments(false);
      setIsLoadingUpcomingSummary(false);
    }
  }, [toast]);

  const fetchPendingTasks = useCallback(async () => {
    setIsLoadingPendingTasks(true);
    setPendingTasksError(null);
    try {
      // Fetch all appointments for the doctor, then filter by status 'Scheduled'
      const response = await fetch(`/api/appointments?doctorId=${MOCK_DOCTOR_ID}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch pending tasks (all appointments)');
      }
      const allDoctorAppointments: Appointment[] = await response.json();
      const scheduledAppointments = allDoctorAppointments.filter(apt => apt.status === 'Scheduled');
      setPendingTasksCount(scheduledAppointments.length);

    } catch (error: any) {
      const errorMsg = error.message || "Could not load pending tasks count.";
      setPendingTasksError(errorMsg);
      toast({ variant: "destructive", title: "Error", description: errorMsg });
    } finally {
      setIsLoadingPendingTasks(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardAppointmentsData();
    fetchPendingTasks();
  }, [fetchDashboardAppointmentsData, fetchPendingTasks]);

   const renderCardContent = (isLoading: boolean, error: string | null, value: number | string, unit: string) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    if (error) {
       return <div className="text-destructive text-xs text-center py-2" title={error}>Error loading</div>;
    }
    return (
      <>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{unit}</p>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Doctor Dashboard</h1>
        <Link href="/doctor/patients/new">
          <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Patient</Button>
        </Link>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderCardContent(isLoadingUpcomingSummary, upcomingSummaryError, upcomingAppointmentsSummaryCount, "In the next few days")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderCardContent(isLoadingPendingTasks, pendingTasksError, pendingTasksCount, "Appointments to Confirm or Review")}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments (Detailed)</CardTitle>
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
                    <TableCell className="font-medium whitespace-nowrap">{apt.patientName || 'N/A'}</TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(apt.date).toLocaleDateString()} - {apt.time}</TableCell>
                    <TableCell className="whitespace-nowrap">{apt.type}</TableCell>
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
    </div>
  );
}
