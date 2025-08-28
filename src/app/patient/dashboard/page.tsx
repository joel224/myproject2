
// src/app/patient/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback, FormEvent, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import type { Patient, Appointment, TreatmentPlan, Invoice, Message, Conversation } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, User, Mail, Phone, Calendar, Stethoscope, FileText, ShieldAlert, HeartPulse, Droplets, Info, Wind, DollarSign, ClipboardList, MessageSquare, Send, Paperclip } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNowStrict } from 'date-fns';

type DashboardData = {
  profile: Patient | null;
  appointments: Appointment[];
  treatmentPlans: TreatmentPlan[];
  invoices: Invoice[];
  conversation: Conversation | null;
  messages: Message[];
};

export default function PatientDashboardPage() {
  const [user, loadingAuth, authError] = useAuthState(auth);
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newMessageText, setNewMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchOptions = { credentials: 'include' as RequestCredentials };
      
      const [profileRes, appointmentsRes, plansRes, invoicesRes, messagesRes] = await Promise.all([
        fetch('/api/patient-profile', fetchOptions),
        fetch('/api/patient-profile/appointments', fetchOptions),
        fetch('/api/patient-profile/treatment-plans', fetchOptions),
        fetch('/api/patient-profile/invoices', fetchOptions),
        fetch('/api/patient-profile/messages', fetchOptions),
      ]);

      if (!profileRes.ok) {
          const errorData = await profileRes.json();
          throw new Error(errorData.message || 'Failed to fetch profile.');
      }
      
      const profileData: Patient = await profileRes.json();
      const appointmentsData = appointmentsRes.ok ? await appointmentsRes.json() : [];
      const plansData = plansRes.ok ? await plansRes.json() : [];
      const invoicesData = invoicesRes.ok ? await invoicesRes.json() : [];
      const messagesData = messagesRes.ok ? await messagesRes.json() : { conversation: null, messages: [] };

      setData({
        profile: profileData,
        appointments: appointmentsData,
        treatmentPlans: plansData,
        invoices: invoicesData,
        conversation: messagesData.conversation,
        messages: messagesData.messages,
      });

    } catch (err: any) {
      console.error("Error in fetchData:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // This hook just checks for a Firebase auth state change on the client.
    // The actual data fetching is triggered below and relies on the httpOnly cookie.
    if (loadingAuth) return;
    if (authError) {
      setError("An authentication error occurred. Please try logging in again.");
      setIsLoading(false);
      return;
    }
    // We don't need to wait for a Firebase user if we are relying on the httpOnly cookie.
    // The presence of the cookie is what matters for our backend API.
    fetchData();
  }, [loadingAuth, authError, fetchData]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages]);


  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessageText.trim() || !user || !data?.conversation) return;

    setIsSendingMessage(true);
    try {
        const response = await fetch('/api/patient-profile/messages', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversationId: data.conversation.id,
                text: newMessageText.trim(),
            }),
            credentials: 'include',
        });

        const newMessage: Message = await response.json();
        if (!response.ok) {
            throw new Error((newMessage as any).message || 'Failed to send message');
        }

        setData(prevData => prevData ? {
            ...prevData,
            messages: [...prevData.messages, newMessage],
        } : null);
        setNewMessageText('');
    } catch (err: any) {
        toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
        setIsSendingMessage(false);
    }
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Loading your details...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Card className="w-full max-w-md mx-auto text-center">
            <CardHeader>
                <CardTitle className="text-destructive">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-muted-foreground">{error}</p>
                <p className="text-sm mt-2">Please ensure you are logged in. If you believe this is an error, please contact the clinic.</p>
                <Button asChild className="mt-6"><Link href="/login">Go to Login</Link></Button>
            </CardContent>
        </Card>
      );
    }

    if (data && data.profile) {
      const patientDetails = data.profile;
      const medicalConditions = [
        { label: 'Diabetes', value: patientDetails.hasDiabetes, icon: <HeartPulse className="mr-2 h-5 w-5 text-red-500" /> },
        { label: 'High Blood Pressure', value: patientDetails.hasHighBloodPressure, icon: <ShieldAlert className="mr-2 h-5 w-5 text-orange-500" /> },
        { label: 'Stroke/Heart Attack History', value: patientDetails.hasStrokeOrHeartAttackHistory, icon: <HeartPulse className="mr-2 h-5 w-5 text-red-700" /> },
        { label: 'Bleeding Disorders', value: patientDetails.hasBleedingDisorders, icon: <Droplets className="mr-2 h-5 w-5 text-blue-500" /> },
        { label: 'Allergies', value: patientDetails.hasAllergy, specifics: patientDetails.allergySpecifics, icon: <Info className="mr-2 h-5 w-5 text-yellow-500" /> },
        { label: 'Asthma/Respiratory Issues', value: patientDetails.hasAsthma, icon: <Wind className="mr-2 h-5 w-5 text-green-500" /> },
      ].filter(condition => condition.value || (condition.label === 'Allergies' && condition.specifics));

      return (
        <Card className="w-full max-w-5xl mx-auto shadow-lg">
          <CardHeader className="bg-muted/30 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                 <Avatar className="h-24 w-24 border-2 border-primary">
                    <AvatarImage src={`https://placehold.co/100x100.png?text=${patientDetails.name.charAt(0)}`} alt={patientDetails.name} data-ai-hint="avatar person" />
                    <AvatarFallback className="text-3xl">{patientDetails.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-3xl">{patientDetails.name}</CardTitle>
                    <CardDescription className="text-md mt-1">Welcome to your personal health dashboard.</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 rounded-none border-b">
                    <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profile</TabsTrigger>
                    <TabsTrigger value="appointments"><Calendar className="mr-2 h-4 w-4" />Appointments</TabsTrigger>
                    <TabsTrigger value="plans"><ClipboardList className="mr-2 h-4 w-4" />Treatment Plans</TabsTrigger>
                    <TabsTrigger value="billing"><DollarSign className="mr-2 h-4 w-4" />Billing</TabsTrigger>
                    <TabsTrigger value="messages"><MessageSquare className="mr-2 h-4 w-4" />Messages</TabsTrigger>
                </TabsList>
                
                <div className="p-6">
                    <TabsContent value="profile" className="space-y-6">
                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary flex items-center"><User className="mr-2 h-5 w-5" />Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm p-4 border rounded-md bg-background">
                                <div className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Email:</strong><span className="ml-2">{patientDetails.email}</span></div>
                                <div className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Phone:</strong><span className="ml-2">{patientDetails.phone || 'N/A'}</span></div>
                                <div className="flex items-center"><Calendar className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Date of Birth:</strong><span className="ml-2">{patientDetails.dateOfBirth ? new Date(patientDetails.dateOfBirth).toLocaleDateString() : 'N/A'}</span></div>
                                <div className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Age:</strong><span className="ml-2">{patientDetails.age !== undefined ? patientDetails.age : 'N/A'}</span></div>
                            </div>
                        </section>
                        <Separator/>
                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary flex items-center"><Stethoscope className="mr-2 h-5 w-5" />Medical Overview</h3>
                            {medicalConditions.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {medicalConditions.map(condition => (
                                    <div key={condition.label} className="flex items-center p-3 bg-background rounded-md border">
                                        {condition.icon}
                                        <div>
                                            <span className="font-medium text-foreground">{condition.label}</span>
                                            {condition.label === 'Allergies' && condition.specifics && (<p className="text-xs text-muted-foreground">Details: {condition.specifics}</p>)}
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            ) : <p className="text-muted-foreground text-sm p-4 border rounded-md bg-background">No specific medical conditions recorded.</p>}
                        </section>
                        {patientDetails.xrayImageUrls && patientDetails.xrayImageUrls.length > 0 && (
                            <>
                                <Separator/>
                                <section>
                                    <h3 className="text-xl font-semibold mb-3 text-primary flex items-center"><FileText className="mr-2 h-5 w-5" />Attached Files</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {patientDetails.xrayImageUrls.map((url, index) => (
                                            <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="block group">
                                                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                                                    <CardContent className="p-0 aspect-square flex items-center justify-center bg-muted">
                                                    {url.toLowerCase().endsWith('.pdf') ? (<FileText className="h-12 w-12 text-destructive" />) : (<Image src={url} alt={`Attachment ${index + 1}`} width={150} height={150} className="object-contain w-full h-full" data-ai-hint="medical scan"/>)}
                                                    </CardContent>
                                                    <div className="p-2 text-xs text-center border-t"><p className="truncate">Attachment {index + 1}</p></div>
                                                </Card>
                                            </a>
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}
                    </TabsContent>
                    
                    <TabsContent value="appointments">
                         <Table>
                            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Type</TableHead><TableHead>Doctor</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {data.appointments.length > 0 ? data.appointments.map(apt => (
                                    <TableRow key={apt.id}><TableCell>{new Date(apt.date).toLocaleDateString()}</TableCell><TableCell>{apt.time}</TableCell><TableCell>{apt.type}</TableCell><TableCell>{apt.doctorName || 'N/A'}</TableCell><TableCell><Badge>{apt.status}</Badge></TableCell></TableRow>
                                )) : <TableRow><TableCell colSpan={5} className="text-center">No appointments found.</TableCell></TableRow>}
                            </TableBody>
                         </Table>
                    </TabsContent>
                    
                    <TabsContent value="plans">
                        <div className="space-y-4">
                        {data.treatmentPlans.length > 0 ? data.treatmentPlans.map(plan => (
                            <Card key={plan.id}>
                                <CardHeader><CardTitle>{plan.title}</CardTitle><CardDescription>Status: <Badge variant={plan.status === 'Active' ? 'default' : 'secondary'}>{plan.status}</Badge> | Start Date: {new Date(plan.startDate).toLocaleDateString()}</CardDescription></CardHeader>
                                <CardContent>
                                    <h4 className="font-semibold mb-2">Procedures:</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">{plan.procedures.map(proc => <li key={proc.id}>{proc.name} - ${proc.cost?.toFixed(2)}</li>)}</ul>
                                </CardContent>
                            </Card>
                        )) : <p className="text-center text-muted-foreground">No treatment plans found.</p>}
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="billing">
                         <Table>
                            <TableHeader><TableRow><TableHead>Invoice ID</TableHead><TableHead>Date</TableHead><TableHead>Total</TableHead><TableHead>Amount Paid</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {data.invoices.length > 0 ? data.invoices.map(inv => (
                                    <TableRow key={inv.id}><TableCell>{inv.id}</TableCell><TableCell>{new Date(inv.date).toLocaleDateString()}</TableCell><TableCell>${inv.totalAmount.toFixed(2)}</TableCell><TableCell>${inv.amountPaid.toFixed(2)}</TableCell><TableCell><Badge>{inv.status}</Badge></TableCell></TableRow>
                                )) : <TableRow><TableCell colSpan={5} className="text-center">No invoices found.</TableCell></TableRow>}
                            </TableBody>
                         </Table>
                    </TabsContent>

                    <TabsContent value="messages" className="flex flex-col h-[60vh]">
                         <div className="flex-grow overflow-y-auto p-4 space-y-4">
                            {data.messages.length > 0 ? data.messages.map(msg => (
                                <div key={msg.id} className={`flex items-end space-x-2 ${msg.senderRole === 'patient' ? 'justify-end' : ''}`}>
                                    {msg.senderRole === 'staff' && (<Avatar className="h-8 w-8"><AvatarFallback>S</AvatarFallback></Avatar>)}
                                    <div className={`p-3 rounded-lg max-w-xs ${msg.senderRole === 'patient' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                        <p className={`text-xs mt-1 text-right ${msg.senderRole === 'patient' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{formatDistanceToNowStrict(new Date(msg.timestamp), { addSuffix: true })}</p>
                                    </div>
                                    {msg.senderRole === 'patient' && (<Avatar className="h-8 w-8"><AvatarImage src={`https://placehold.co/32x32.png?text=${patientDetails.name.charAt(0)}`} alt={patientDetails.name} data-ai-hint="avatar person"/><AvatarFallback>{patientDetails.name.charAt(0)}</AvatarFallback></Avatar>)}
                                </div>
                            )) : <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="border-t p-4">
                            <div className="relative">
                                <Textarea placeholder="Type your message..." className="pr-20 resize-none" value={newMessageText} onChange={(e) => setNewMessageText(e.target.value)} disabled={isSendingMessage} />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                                    <Button size="icon" aria-label="Send message" type="submit" disabled={isSendingMessage || !newMessageText.trim()}>
                                        {isSendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5"/>}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </TabsContent>
                </div>
             </Tabs>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return <div>{renderContent()}</div>;
}
