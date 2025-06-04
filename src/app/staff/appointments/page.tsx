
// src/app/staff/appointments/page.tsx
'use client';

import { useState, useEffect, type FormEvent, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Patient, StaffMember, Appointment } from '@/lib/types';
import { PlusCircle, Loader2, Edit, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const APPOINTMENT_TYPES = [
  "Check-up", "Cleaning", "Consultation", "Emergency", "Follow-up", 
  "Filling", "Extraction", "Whitening", "Root Canal", "Crown/Bridge Work", "Other"
];
const APPOINTMENT_STATUSES: Appointment['status'][] = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'];


export default function StaffAppointmentsPage() {
  const { toast } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<StaffMember[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);

  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [isLoadingUpcomingAppointments, setIsLoadingUpcomingAppointments] = useState(true);
  const [upcomingAppointmentsError, setUpcomingAppointmentsError] = useState<string | null>(null);

  // State for Edit/Cancel Modals
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string | null>(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);


  const parseTime = (timeStr: string): Date => {
    const [time, modifier] = timeStr.split(' ');
    if (!time || !modifier) { 
      const now = new Date();
      now.setHours(0,0,0,0); 
      return now;
    }
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0; 
    const date = new Date(); 
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const fetchUpcomingAppointments = useCallback(async () => {
    setIsLoadingUpcomingAppointments(true);
    setUpcomingAppointmentsError(null);
    try {
      const response = await fetch('/api/appointments');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch appointments');
      }
      const data: Appointment[] = await response.json();
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
          return parseTime(a.time).getTime() - parseTime(b.time).getTime();
        });
      setUpcomingAppointments(filteredAndSorted);
    } catch (error: any) {
      console.error("Error fetching upcoming appointments:", error);
      setUpcomingAppointmentsError(error.message || "Could not load upcoming appointments.");
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not load upcoming appointments." });
    } finally {
      setIsLoadingUpcomingAppointments(false);
    }
  }, [toast]);


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
    fetchUpcomingAppointments();
  }, [toast, fetchUpcomingAppointments]);

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoadingDoctors(true);
      try {
        const response = await fetch('/api/staff?role=Dentist&role=Hygienist'); 
        if (!response.ok) throw new Error('Failed to fetch staff');
        let staffData: StaffMember[] = await response.json();
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


  const handleCreateAppointment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsBookingLoading(true);

    if (!selectedPatientId || !selectedDoctorId || !appointmentType || !appointmentDate || !appointmentTime) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      setIsBookingLoading(false);
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
      setSelectedPatientId('');
      setSelectedDoctorId('');
      setAppointmentType('');
      setAppointmentDate(new Date().toISOString().split('T')[0]);
      setAppointmentTime('');
      fetchUpcomingAppointments(); 
    } catch (err: any) {
      toast({ variant: "destructive", title: "Booking Error", description: err.message });
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleEditAppointmentSubmit = async (updatedAppointmentData: Partial<Appointment>) => {
    if (!editingAppointment) return;
    try {
      const response = await fetch(`/api/appointments/${editingAppointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAppointmentData),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || (result.errors ? JSON.stringify(result.errors) : "Failed to update appointment"));
      }
      toast({ title: "Appointment Updated!", description: "The appointment details have been successfully updated." });
      fetchUpcomingAppointments();
      setIsEditModalOpen(false);
      setEditingAppointment(null);
      return true;
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Error", description: err.message });
      return false;
    }
  };

  const handleConfirmCancelAppointment = async () => {
    if (!cancellingAppointmentId) return;
    try {
      const response = await fetch(`/api/appointments/${cancellingAppointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' }),
      });
       const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to cancel appointment");
      }
      toast({ title: "Appointment Cancelled", description: "The appointment has been marked as cancelled." });
      fetchUpcomingAppointments();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Cancellation Error", description: err.message });
    } finally {
      setIsCancelConfirmOpen(false);
      setCancellingAppointmentId(null);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Appointment Scheduling</h1>
      </div>

      <div className="grid lg:grid-cols-3 md:grid-cols-1 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Schedule New Appointment</CardTitle>
            <CardDescription>Fill in the details to book a new appointment.</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateAppointment}>
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
                      patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.email})</SelectItem>)
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">No patients found. <Link href="/staff/patients/new" className="text-primary hover:underline">Create one?</Link></div>
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
                      <div className="p-4 text-center text-sm text-muted-foreground">No doctors/hygienists found. <Link href="/staff/manage-staff/new?role=Dentist" className="text-primary hover:underline">Add one?</Link></div>
                    )}
                  </SelectContent>
                </Select>
                <Link href="/staff/manage-staff/new?role=Dentist" className="text-xs text-primary hover:underline mt-1 inline-block">
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
                    {APPOINTMENT_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input type="date" id="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required />
              </div>
              <div>
                <Label htmlFor="time">Time (e.g., 02:30 PM)</Label>
                <Input 
                  type="text" 
                  id="time" 
                  value={appointmentTime} 
                  onChange={e => setAppointmentTime(e.target.value)} 
                  placeholder="HH:MM AM/PM" 
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={isBookingLoading || isLoadingPatients || isLoadingDoctors}>
                {isBookingLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Book Appointment
              </Button>
            </CardContent>
          </form>
        </Card>

        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Clinic Calendar Overview</CardTitle>
                    <CardDescription>Select a date to view appointments.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                        mode="single"
                        selected={appointmentDate ? new Date(appointmentDate) : undefined}
                        onSelect={(date) => setAppointmentDate(date ? date.toISOString().split('T')[0] : '')}
                        className="rounded-md border"
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                     <CardDescription>Live list of scheduled upcoming appointments.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingUpcomingAppointments ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="ml-2 text-muted-foreground">Loading appointments...</p>
                        </div>
                    ) : upcomingAppointmentsError ? (
                         <div className="flex flex-col items-center justify-center p-4 text-destructive">
                            <AlertTriangle className="h-8 w-8 mb-2" />
                            <p>{upcomingAppointmentsError}</p>
                        </div>
                    ) : upcomingAppointments.length > 0 ? (
                        <ul className="space-y-3 max-h-96 overflow-y-auto">
                        {upcomingAppointments.slice(0, 10).map(apt => ( 
                            <li key={apt.id} className="p-3 border rounded-md bg-muted/20">
                            <p className="font-semibold">{apt.patientName} with {apt.doctorName}</p>
                            <p className="text-sm text-muted-foreground">{new Date(apt.date).toLocaleDateString()} at {apt.time} - {apt.type} ({apt.status})</p>
                            <div className="mt-2 space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => { setEditingAppointment(apt); setIsEditModalOpen(true); }}
                                  disabled={apt.status === 'Completed' || apt.status === 'Cancelled'}
                                >
                                    <Edit className="mr-1 h-3 w-3" />Edit
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => { setCancellingAppointmentId(apt.id); setIsCancelConfirmOpen(true); }}
                                  disabled={apt.status === 'Completed' || apt.status === 'Cancelled'}
                                >
                                    <Trash2 className="mr-1 h-3 w-3" />Cancel
                                </Button>
                            </div>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">No upcoming appointments scheduled.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
      {editingAppointment && (
        <EditAppointmentDialog
          appointment={editingAppointment}
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSave={handleEditAppointmentSubmit}
          patients={patients}
          doctors={doctors}
        />
      )}
      <CancelAppointmentDialog
        isOpen={isCancelConfirmOpen}
        onOpenChange={setIsCancelConfirmOpen}
        onConfirm={handleConfirmCancelAppointment}
      />
    </div>
  );
}

// Edit Appointment Dialog Component
interface EditAppointmentDialogProps {
  appointment: Appointment;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedData: Partial<Appointment>) => Promise<boolean>; // Returns true on success
  patients: Patient[];
  doctors: StaffMember[];
}

function EditAppointmentDialog({ appointment, isOpen, onOpenChange, onSave, patients, doctors }: EditAppointmentDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Appointment>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (appointment) {
      // Format date correctly for input type="date"
      const formattedDate = appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '';
      setFormData({ ...appointment, date: formattedDate });
    }
  }, [appointment, isOpen]);

  const handleChange = (name: keyof Appointment, value: string | undefined) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Basic validation
    if (!formData.patientId || !formData.doctorId || !formData.date || !formData.time || !formData.type || !formData.status) {
      toast({ variant: "destructive", title: "Validation Error", description: "All fields are required to update an appointment." });
      setIsSaving(false);
      return;
    }
    const success = await onSave(formData);
    if (success) {
        onOpenChange(false); // Close dialog on successful save
    }
    setIsSaving(false);
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>Modify the details for appointment ID: {appointment.id}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-1">
              <Label htmlFor="edit-patient">Patient</Label>
              <Select value={formData.patientId} onValueChange={(val) => handleChange('patientId', val)}>
                <SelectTrigger id="edit-patient"><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-doctor">Doctor/Hygienist</Label>
              <Select value={formData.doctorId} onValueChange={(val) => handleChange('doctorId', val)}>
                <SelectTrigger id="edit-doctor"><SelectValue placeholder="Select doctor/hygienist" /></SelectTrigger>
                <SelectContent>
                  {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name} ({d.role})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-appointment-type">Appointment Type</Label>
              <Select value={formData.type} onValueChange={(val) => handleChange('type', val)}>
                <SelectTrigger id="edit-appointment-type"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-date">Date</Label>
              <Input id="edit-date" type="date" value={formData.date || ''} onChange={e => handleChange('date', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-time">Time</Label>
              <Input id="edit-time" type="text" placeholder="HH:MM AM/PM" value={formData.time || ''} onChange={e => handleChange('time', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(val) => handleChange('status', val as Appointment['status'])}>
                <SelectTrigger id="edit-status"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Input id="edit-notes" placeholder="Any notes for this appointment" value={formData.notes || ''} onChange={e => handleChange('notes', e.target.value)} />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Cancel Confirmation Dialog
interface CancelAppointmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

function CancelAppointmentDialog({ isOpen, onOpenChange, onConfirm }: CancelAppointmentDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will mark the appointment as 'Cancelled'. This cannot be undone easily.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Dismiss</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm Cancellation</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

