
// src/app/staff/appointments/page.tsx
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockAppointments } from "@/lib/mockData"; // Still using for list display for now
import type { Patient, StaffMember, Appointment } from '@/lib/types';
import { PlusCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function StaffAppointmentsPage() {
  const { toast } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<StaffMember[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);

  // Fetch patients for dropdown
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoadingPatients(true);
      try {
        const response = await fetch('/api/patients');
        if (!response.ok) throw new Error('Failed to fetch patients');
        const data: Patient[] = await response.json();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load patients." });
      } finally {
        setIsLoadingPatients(false);
      }
    };
    fetchPatients();
  }, [toast]);

  // Fetch doctors/hygienists for dropdown
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoadingDoctors(true);
      try {
        const response = await fetch('/api/staff');
        if (!response.ok) throw new Error('Failed to fetch staff');
        let staffData: StaffMember[] = await response.json();
        staffData = staffData.filter(s => s.role === 'Dentist' || s.role === 'Hygienist');
        setDoctors(staffData);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load doctors list." });
      } finally {
        setIsLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, [toast]);


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!selectedPatientId || !selectedDoctorId || !appointmentType || !appointmentDate || !appointmentTime) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      setIsLoading(false);
      return;
    }

    const appointmentData = {
      patientId: selectedPatientId,
      doctorId: selectedDoctorId,
      date: appointmentDate,
      time: appointmentTime, 
      type: appointmentType,
    };

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || (result.errors ? JSON.stringify(result.errors) : "Failed to book appointment"));
      }

      toast({ title: "Appointment Booked!", description: `Appointment for ${appointmentType} on ${appointmentDate} at ${appointmentTime} has been scheduled.` });
      // Reset form
      setSelectedPatientId('');
      setSelectedDoctorId('');
      setAppointmentType('');
      setAppointmentDate('');
      setAppointmentTime('');
      // TODO: Refresh the upcoming appointments list
    } catch (err: any) {
      toast({ variant: "destructive", title: "Booking Error", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const futureAppointments = mockAppointments.filter(apt => new Date(apt.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Appointment Scheduling</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Schedule New Appointment</CardTitle>
            <CardDescription>Fill in the details to book a new appointment.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="patient">Patient</Label>
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId} required>
                  <SelectTrigger id="patient" disabled={isLoadingPatients}>
                    <SelectValue placeholder={isLoadingPatients ? "Loading patients..." : "Select patient"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingPatients ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">Loading patients...</div>
                    ) : patients.length > 0 ? (
                      patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">No patients found.</div>
                    )}
                  </SelectContent>
                </Select>
                <Link href="/staff/patients/new" className="text-xs text-primary hover:underline mt-1 inline-block">
                  <PlusCircle className="inline h-3 w-3 mr-1"/> Add New Patient
                </Link>
              </div>
              <div>
                <Label htmlFor="doctor">Doctor / Hygienist</Label>
                <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId} required>
                  <SelectTrigger id="doctor" disabled={isLoadingDoctors}>
                    <SelectValue placeholder={isLoadingDoctors ? "Loading doctors..." : "Select doctor/hygienist"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDoctors ? (
                       <div className="p-4 text-center text-sm text-muted-foreground">Loading doctors...</div>
                    ) : doctors.length > 0 ? (
                       doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name} ({d.role})</SelectItem>)
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">No doctors/hygienists found.</div>
                    )}
                  </SelectContent>
                </Select>
                <Link href="/staff/manage-staff/new?role=doctor" className="text-xs text-primary hover:underline mt-1 inline-block">
                  <PlusCircle className="inline h-3 w-3 mr-1"/> Add New Doctor/Hygienist
                </Link>
              </div>
              <div>
                <Label htmlFor="appointment-type">Appointment Type</Label>
                <Select value={appointmentType} onValueChange={setAppointmentType} required>
                  <SelectTrigger id="appointment-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Check-up">Check-up</SelectItem>
                    <SelectItem value="Cleaning">Cleaning</SelectItem>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Filling">Filling</SelectItem>
                    <SelectItem value="Extraction">Extraction</SelectItem>
                    <SelectItem value="Whitening">Whitening</SelectItem>
                    <SelectItem value="Root Canal">Root Canal</SelectItem>
                    <SelectItem value="Crown">Crown/Bridge Work</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input type="date" id="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="time">Time (e.g., 02:30 PM)</Label>
                <Input type="text" id="time" value={appointmentTime} onChange={e => setAppointmentTime(e.target.value)} placeholder="HH:MM AM/PM" required 
                       pattern="^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$"
                       title="Please enter time in HH:MM AM/PM format (e.g., 02:30 PM or 9:00 AM)"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || isLoadingPatients || isLoadingDoctors}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Book Appointment
              </Button>
            </CardContent>
          </form>
        </Card>

        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Clinic Calendar Overview</CardTitle>
                    <CardDescription>Select a date to view appointments.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                        mode="single"
                        className="rounded-md border"
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Appointments (Mock Data)</CardTitle>
                     <CardDescription>This list uses mock data. Real data would appear after booking.</CardDescription>
                </CardHeader>
                <CardContent>
                    {futureAppointments.length > 0 ? (
                        <ul className="space-y-3">
                        {futureAppointments.slice(0, 5).map(apt => (
                            <li key={apt.id} className="p-3 border rounded-md bg-muted/20">
                            <p className="font-semibold">{apt.patientName} with {apt.doctorName}</p>
                            <p className="text-sm text-muted-foreground">{new Date(apt.date).toLocaleDateString()} at {apt.time} - {apt.type} ({apt.status})</p>
                            <div className="mt-2 space-x-2">
                                <Button variant="outline" size="sm">Edit</Button>
                                <Button variant="destructive" size="sm">Cancel</Button>
                            </div>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">No upcoming appointments (from mock data).</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
