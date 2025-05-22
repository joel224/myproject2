
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { mockAppointments, mockInvoices, mockPatients } from "@/lib/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, Users, DollarSign, MessageSquare, AlertCircle, CheckCircle, Clock, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StaffDashboardPage() {
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = mockAppointments.filter(apt => apt.date === today && apt.status !== 'Completed' && apt.status !== 'Cancelled');
  const pendingRequests = 2; // Placeholder
  const unreadMessages = 3; // Placeholder
  const outstandingPayments = mockInvoices.filter(inv => inv.status === 'Pending' || inv.status === 'Overdue' || inv.status === 'Partial').length;

  const quickActions = [
    { label: "New Appointment", href: "/staff/appointments", icon: <CalendarPlus className="h-5 w-5" /> },
    { label: "Patient List", href: "/staff/patients", icon: <Users className="h-5 w-5" /> },
    { label: "Manage Payments", href: "/staff/payments", icon: <DollarSign className="h-5 w-5" /> },
    { label: "Send Message", href: "/staff/communication", icon: <MessageSquare className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Staff Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysAppointments.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outstandingPayments}</div>
            <p className="text-xs text-muted-foreground">Invoices needing payment</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadMessages}</div>
            <p className="text-xs text-muted-foreground">From patients</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Appointments for {new Date(today).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.</CardDescription>
          </CardHeader>
          <CardContent>
            {todaysAppointments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todaysAppointments.map(apt => (
                    <TableRow key={apt.id}>
                      <TableCell>{apt.time}</TableCell>
                      <TableCell>{apt.patientName || mockPatients.find(p=>p.id === apt.patientId)?.name}</TableCell>
                      <TableCell>{apt.type}</TableCell>
                      <TableCell>{apt.doctorName}</TableCell>
                      <TableCell><Badge variant={apt.status === 'Confirmed' ? 'default' : 'secondary'}>{apt.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No appointments scheduled for today.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Access common tasks quickly.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {quickActions.map(action => (
                <Link href={action.href} key={action.label} passHref>
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center text-center">
                    {action.icon}
                    <span className="mt-1 text-xs">{action.label}</span>
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update Live Wait Time</CardTitle>
              <CardDescription>Set the current estimated wait time displayed on the homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="liveWaitTime" className="mb-1 block">Current Wait Time Text</Label>
                <Input id="liveWaitTime" placeholder="e.g., <15 mins, Approx. 30 mins" />
              </div>
              <Button 
                className="w-full" 
                onClick={() => console.log('Update wait time clicked. Backend integration needed.')}
              >
                <Edit className="mr-2 h-4 w-4" /> Set Wait Time
              </Button>
              <p className="text-xs text-muted-foreground pt-1">
                This will update the time shown on the homepage once the backend is connected.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Clinic Announcements</CardTitle>
            <CardDescription>Important updates and information for staff.</CardDescription>
        </CardHeader>
        <CardContent>
            {/* Placeholder for announcements */}
            <div className="p-4 bg-accent/30 rounded-md">
                <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent mt-1" />
                    <div>
                        <h4 className="font-semibold text-accent-foreground">System Maintenance Scheduled</h4>
                        <p className="text-sm text-muted-foreground">The patient portal will be briefly unavailable this Sunday from 2 AM to 3 AM for scheduled maintenance.</p>
                    </div>
                </div>
            </div>
             <div className="p-4 bg-destructive/10 rounded-md mt-3">
                <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-destructive mt-1" />
                    <div>
                        <h4 className="font-semibold text-destructive-foreground">Reminder: Staff Meeting</h4>
                        <p className="text-sm text-muted-foreground">Monthly staff meeting tomorrow at 9 AM in the conference room. Please be punctual.</p>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
