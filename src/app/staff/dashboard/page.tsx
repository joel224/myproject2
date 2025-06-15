
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Appointment, Invoice, Conversation } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, Users, DollarSign, MessageSquare, AlertCircle, CheckCircle, Clock, Edit, Loader2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ClinicWaitTime {
  text: string;
  updatedAt: string;
}

export default function StaffDashboardPage() {
  const { toast } = useToast();

  // Wait Time State
  const [waitTimeText, setWaitTimeText] = useState('');
  const [isUpdatingWaitTime, setIsUpdatingWaitTime] = useState(false);

  // Appointments State
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
  const [isLoadingTodaysAppointments, setIsLoadingTodaysAppointments] = useState(true);
  const [todaysAppointmentsError, setTodaysAppointmentsError] = useState<string | null>(null);

  // Pending Requests (Scheduled Appointments) State
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [isLoadingPendingRequests, setIsLoadingPendingRequests] = useState(true);
  const [pendingRequestsError, setPendingRequestsError] = useState<string | null>(null);

  // Outstanding Payments State
  const [outstandingPaymentsCount, setOutstandingPaymentsCount] = useState(0);
  const [isLoadingOutstandingPayments, setIsLoadingOutstandingPayments] = useState(true);
  const [outstandingPaymentsError, setOutstandingPaymentsError] = useState<string | null>(null);

  // Unread Messages State
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isLoadingUnreadMessages, setIsLoadingUnreadMessages] = useState(true);
  const [unreadMessagesError, setUnreadMessagesError] = useState<string | null>(null);


  const fetchDashboardData = useCallback(async () => {
    setIsLoadingTodaysAppointments(true);
    setTodaysAppointmentsError(null);
    setIsLoadingPendingRequests(true);
    setPendingRequestsError(null);
    setIsLoadingOutstandingPayments(true);
    setOutstandingPaymentsError(null);
    setIsLoadingUnreadMessages(true);
    setUnreadMessagesError(null);

    try {
      const [appointmentsRes, invoicesRes, conversationsRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/invoices'),
        fetch('/api/conversations')
      ]);

      // Process Appointments
      if (!appointmentsRes.ok) {
        const errorData = await appointmentsRes.json();
        const errorMsg = errorData.message || 'Failed to fetch appointments';
        setTodaysAppointmentsError(errorMsg);
        setPendingRequestsError(errorMsg);
      } else {
        const allAppointments: Appointment[] = await appointmentsRes.json();
        const todayISO = new Date().toISOString().split('T')[0];
        
        const filteredTodays = allAppointments.filter(apt => 
          apt.date === todayISO && 
          apt.status !== 'Completed' && 
          apt.status !== 'Cancelled'
        );
        setTodaysAppointments(filteredTodays);

        const scheduledAppointments = allAppointments.filter(apt => apt.status === 'Scheduled');
        setPendingRequestsCount(scheduledAppointments.length);
      }

      // Process Invoices
      if (!invoicesRes.ok) {
        const errorData = await invoicesRes.json();
        setOutstandingPaymentsError(errorData.message || 'Failed to fetch invoices');
      } else {
        const allInvoices: Invoice[] = await invoicesRes.json();
        const outstanding = allInvoices.filter(inv => 
            inv.status === 'Pending' || inv.status === 'Overdue' || inv.status === 'Partial'
        ).length;
        setOutstandingPaymentsCount(outstanding);
      }

      // Process Conversations
      if (!conversationsRes.ok) {
        const errorData = await conversationsRes.json();
        setUnreadMessagesError(errorData.message || 'Failed to fetch conversations');
      } else {
        const allConversations: Conversation[] = await conversationsRes.json();
        const unread = allConversations.reduce((sum, convo) => sum + (convo.unreadCountForStaff || 0), 0);
        setUnreadMessagesCount(unread);
      }

    } catch (error: any) {
      const generalErrorMsg = "Could not load some dashboard data.";
      if (!todaysAppointmentsError) setTodaysAppointmentsError(generalErrorMsg);
      if (!pendingRequestsError) setPendingRequestsError(generalErrorMsg);
      if (!outstandingPaymentsError) setOutstandingPaymentsError(generalErrorMsg);
      if (!unreadMessagesError) setUnreadMessagesError(generalErrorMsg);
      toast({ variant: "destructive", title: "Dashboard Error", description: error.message || generalErrorMsg });
    } finally {
      setIsLoadingTodaysAppointments(false);
      setIsLoadingPendingRequests(false);
      setIsLoadingOutstandingPayments(false);
      setIsLoadingUnreadMessages(false);
    }
  }, [toast, todaysAppointmentsError, pendingRequestsError, outstandingPaymentsError, unreadMessagesError]);


  useEffect(() => {
    const fetchWaitTime = async () => {
      // This can remain separate as it's a simple, single fetch
      try {
        const response = await fetch('/api/clinic/wait-time');
        if (!response.ok) {
          throw new Error('Failed to fetch wait time');
        }
        const data: ClinicWaitTime = await response.json();
        setWaitTimeText(data.text);
      } catch (error) {
        console.error("Error fetching wait time:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load current wait time.",
        });
      }
    };
    fetchWaitTime();
    fetchDashboardData();
  }, [toast, fetchDashboardData]);


  const handleUpdateWaitTime = async () => {
    if (!waitTimeText.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Wait time text cannot be empty.",
      });
      return;
    }
    setIsUpdatingWaitTime(true);
    try {
      const response = await fetch('/api/clinic/wait-time', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: waitTimeText }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update wait time');
      }
      const updatedData: ClinicWaitTime = await response.json();
      setWaitTimeText(updatedData.text);
      toast({
        title: "Success!",
        description: `Wait time updated to: ${updatedData.text}`,
      });
    } catch (error: any) {
      console.error("Error updating wait time:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not update wait time.",
      });
    } finally {
      setIsUpdatingWaitTime(false);
    }
  };

  const quickActions = [
    { label: "New Appointment", href: "/staff/appointments", icon: <CalendarPlus className="h-5 w-5" /> },
    { label: "Patient List", href: "/staff/patients", icon: <Users className="h-5 w-5" /> },
    { label: "Manage Payments", href: "/staff/payments", icon: <DollarSign className="h-5 w-5" /> },
    { label: "Send Message", href: "/staff/communication", icon: <MessageSquare className="h-5 w-5" /> },
  ];

  const renderCardContent = (isLoading: boolean, error: string | null, value: number | string, unit: string) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    if (error) {
      return <div className="text-destructive text-xs text-center py-2" title={error}>{error.length > 25 ? "Error" : error}</div>;
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
      <h1 className="text-2xl sm:text-3xl font-bold">Staff Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderCardContent(isLoadingTodaysAppointments, todaysAppointmentsError, todaysAppointments.length, "Scheduled for today")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderCardContent(isLoadingPendingRequests, pendingRequestsError, pendingRequestsCount, "Appointments awaiting action")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderCardContent(isLoadingOutstandingPayments, outstandingPaymentsError, outstandingPaymentsCount, "Invoices needing payment")}
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderCardContent(isLoadingUnreadMessages, unreadMessagesError, unreadMessagesCount, "From patients")}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Appointments for {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTodaysAppointments ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading schedule...</p>
              </div>
            ) : todaysAppointmentsError ? (
              <div className="flex flex-col items-center justify-center p-4 text-destructive">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <p>{todaysAppointmentsError}</p>
              </div>
            ) : todaysAppointments.length > 0 ? (
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
                      <TableCell>{apt.patientName || 'N/A'}</TableCell>
                      <TableCell>{apt.type}</TableCell>
                      <TableCell>{apt.doctorName || 'N/A'}</TableCell>
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
                <Input 
                  id="liveWaitTime" 
                  placeholder="e.g., <15 mins" 
                  value={waitTimeText}
                  onChange={(e) => setWaitTimeText(e.target.value)}
                  disabled={isUpdatingWaitTime}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleUpdateWaitTime}
                disabled={isUpdatingWaitTime}
              >
                <Edit className="mr-2 h-4 w-4" /> 
                {isUpdatingWaitTime ? 'Updating...' : 'Set Wait Time'}
              </Button>
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
