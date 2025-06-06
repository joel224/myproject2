
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';

// Mock current doctor ID - in a real app, this would come from auth context
const MOCK_DOCTOR_ID = "doc1";

export default function DoctorAppointmentsPage() {
  const { toast } = useToast();
  const [doctorAppointments, setDoctorAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const fetchDoctorAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/appointments?doctorId=${MOCK_DOCTOR_ID}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch appointments');
      }
      let data: Appointment[] = await response.json();
      
      // Sort appointments by date and time
      const parseTime = (timeStr: string) => {
            const [time, modifier] = timeStr.split(' ');
            if (!time || !modifier) return 0;
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0; // Midnight case
            return hours * 60 + minutes;
      };

      data.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return parseTime(a.time) - parseTime(b.time);
      });

      setDoctorAppointments(data);
    } catch (err: any) {
      setError(err.message || "Could not load appointments.");
      toast({ variant: "destructive", title: "Error", description: err.message || "Could not load appointments." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDoctorAppointments();
  }, [fetchDoctorAppointments]);

  // Filter appointments for the selected date on the calendar
  const appointmentsForSelectedDate = doctorAppointments.filter(apt => {
    if (!selectedDate) return true; // Show all if no date selected (or handle as needed)
    const aptDate = new Date(apt.date);
    aptDate.setHours(0,0,0,0); // Normalize appointment date
    const selDate = new Date(selectedDate);
    selDate.setHours(0,0,0,0); // Normalize selected date
    return aptDate.getTime() === selDate.getTime();
  });


  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">My Appointments</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Select a date to view appointments.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                // TODO: Add event indicators to the calendar here based on doctorAppointments
              />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Appointment List</CardTitle>
              <CardDescription>
                {selectedDate 
                  ? `Appointments for ${selectedDate.toLocaleDateString()}` 
                  : "All your scheduled appointments."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">Loading appointments...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-4 text-destructive">
                  <AlertTriangle className="h-8 w-8 mb-2" />
                  <p>{error}</p>
                </div>
              ) : appointmentsForSelectedDate.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointmentsForSelectedDate.map(apt => (
                      <TableRow key={apt.id}>
                        <TableCell>{new Date(apt.date).toLocaleDateString()} - {apt.time}</TableCell>
                        <TableCell>{apt.patientName || 'N/A'}</TableCell>
                        <TableCell>{apt.type}</TableCell>
                        <TableCell><Badge variant={apt.status === 'Confirmed' || apt.status === 'Completed' ? 'default' : 'secondary'}>{apt.status}</Badge></TableCell>
                        <TableCell className="text-right space-x-1">
                           {apt.status === 'Scheduled' && <Button variant="outline" size="sm">Confirm</Button>}
                           {apt.status !== 'Completed' && apt.status !== 'Cancelled' && <Button variant="outline" size="sm">Reschedule</Button>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  {selectedDate ? "No appointments found for the selected date." : "No appointments found."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
