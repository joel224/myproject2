import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { mockAppointments, mockPatients, mockStaff } from "@/lib/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DoctorAppointmentsPage() {
  // Filter appointments for the logged-in doctor (assuming doc1 for mock)
  const doctorAppointments = mockAppointments
    .filter(apt => apt.doctorId === 'doc1')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Appointments</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Your upcoming schedule.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                // selected={date}
                // onSelect={setDate}
                className="rounded-md border"
                // You might want to add event indicators to the calendar here
              />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Appointment List</CardTitle>
              <CardDescription>All your scheduled appointments.</CardDescription>
            </CardHeader>
            <CardContent>
              {doctorAppointments.length > 0 ? (
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
                    {doctorAppointments.map(apt => (
                      <TableRow key={apt.id}>
                        <TableCell>{new Date(apt.date).toLocaleDateString()} - {apt.time}</TableCell>
                        <TableCell>{apt.patientName || mockPatients.find(p => p.id === apt.patientId)?.name}</TableCell>
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
                <p className="text-muted-foreground">No appointments found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
