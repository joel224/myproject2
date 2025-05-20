import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockAppointments, mockPatients, mockStaff } from "@/lib/mockData";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function StaffAppointmentsPage() {
  // This is a simplified version. A real app would use a more interactive calendar component.
  // For now, it shows a form to add appointments and lists existing ones.
  const futureAppointments = mockAppointments.filter(apt => new Date(apt.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Appointment Scheduling</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Schedule New Appointment</CardTitle>
            <CardDescription>Fill in the details to book a new appointment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="patient">Patient</Label>
              <Select>
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {mockPatients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Link href="/staff/patients/new" className="text-xs text-primary hover:underline mt-1 inline-block">
                <PlusCircle className="inline h-3 w-3 mr-1"/> Add New Patient
              </Link>
            </div>
            <div>
              <Label htmlFor="doctor">Doctor</Label>
              <Select>
                <SelectTrigger id="doctor">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {mockStaff.filter(s => s.role === 'Dentist' || s.role === 'Hygienist').map(d => <SelectItem key={d.id} value={d.id}>{d.name} ({d.role})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="appointment-type">Appointment Type</Label>
              <Select>
                <SelectTrigger id="appointment-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Check-up">Check-up</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                  <SelectItem value="Consultation">Consultation</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input type="date" id="date" />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input type="time" id="time" />
            </div>
            <Button className="w-full">Book Appointment</Button>
          </CardContent>
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
                        // selected={date}
                        // onSelect={setDate}
                        className="rounded-md border"
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
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
                        <p className="text-muted-foreground">No upcoming appointments.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
