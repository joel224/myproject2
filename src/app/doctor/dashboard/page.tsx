
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { mockAppointments, mockPatients } from "@/lib/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DoctorDashboardPage() {
  const upcomingAppointments = mockAppointments.filter(apt => new Date(apt.date) >= new Date() && apt.status !== 'Completed' && apt.status !== 'Cancelled').slice(0, 5);
  const recentPatients = mockPatients.slice(0,3);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
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
          {upcomingAppointments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingAppointments.map(apt => (
                  <TableRow key={apt.id}>
                    <TableCell>{apt.patientName}</TableCell>
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
            <p className="text-muted-foreground">No upcoming appointments scheduled.</p>
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
            <ul className="space-y-1">
              {recentPatients.map(p => (
                <li key={p.id}>
                  <Link href={`/doctor/patients/${p.id}`} className="text-primary hover:underline">{p.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Patients</CardTitle>
            <CardDescription>Currently managed patients</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{mockPatients.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Today &amp; tomorrow</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{upcomingAppointments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
            <CardDescription>Notes or follow-ups</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">3</p> {/* Placeholder */}
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
