
'use client'

import { mockPatients, mockAppointments, mockTreatmentPlans, mockProgressNotes, mockStaff } from '@/lib/mockData';
import type { TreatmentPlan, ProgressNote, Procedure, Appointment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, FileTextIcon, ClipboardListIcon, Edit3, PlusCircle, Image as ImageIcon, Trash2, DollarSign, Clock } from 'lucide-react'; // Renamed Image to ImageIcon
import Image from 'next/image'; // Next.js Image component
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation'; // Added useParams
import { useEffect, useState, type FormEvent, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// PatientPageProps interface is no longer needed here for params
// interface PatientPageProps {
//   params: { patientId: string };
// }

export default function PatientDetailPage() { // Removed params from props
  const params = useParams(); // Use the hook
  const patientId = params.patientId as string; // Get patientId from the hook's result

  const searchParams = useSearchParams();
  const routerAppointmentId = searchParams.get('appointment');
  const { toast } = useToast();

  const [patient, setPatient] = useState<typeof mockPatients[0] | undefined>(undefined);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>([]);
  
  const [activeTab, setActiveTab] = useState('treatment-plans');
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    // Simulate fetching data
    // In a real app, you'd fetch this data from your API
    const foundPatient = mockPatients.find(p => p.id === patientId);
    setPatient(foundPatient);
    setAppointments(mockAppointments.filter(a => a.patientId === patientId));
    setTreatmentPlans(mockTreatmentPlans.filter(tp => tp.patientId === patientId));
    setProgressNotes(mockProgressNotes.filter(pn => pn.patientId === patientId));
    setIsLoading(false);

    if (routerAppointmentId) {
      setActiveTab('appointments');
      // You could add logic here to scroll to the specific appointment if the list is long
      // console.log("Navigated with appointment ID:", routerAppointmentId);
    }
  }, [patientId, routerAppointmentId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading patient details...</p>
      </div>
    );
  }

  if (!patient) {
    return <div className="container mx-auto p-4 text-center text-destructive">Patient not found.</div>;
  }

  // Handlers for CRUD operations - to be implemented with API calls
  const handleAddOrUpdateTreatmentPlan = async (planData: Omit<TreatmentPlan, 'id' | 'patientId'>, planIdToUpdate?: string) => {
    // Mock implementation - replace with API call
    toast({ title: planIdToUpdate ? "Plan Updated (Mock)" : "Plan Added (Mock)", description: "This is a mock action."});
    if (planIdToUpdate) {
        setTreatmentPlans(prev => prev.map(p => p.id === planIdToUpdate ? { ...p, ...planData, id: planIdToUpdate, patientId } : p));
    } else {
        const newPlan = { ...planData, id: `tp_mock_${Date.now()}`, patientId };
        setTreatmentPlans(prev => [...prev, newPlan]);
    }
  };

  const handleDeleteTreatmentPlan = async (planId: string) => {
    // Mock implementation
    toast({ title: "Plan Deleted (Mock)", variant: "destructive" });
    setTreatmentPlans(prev => prev.filter(p => p.id !== planId));
  };

  const handleAddOrUpdateProgressNote = async (noteData: Omit<ProgressNote, 'id' | 'patientId' | 'images'> & { images?: ProgressNote['images'] }, noteIdToUpdate?: string) => {
    // Mock implementation
     toast({ title: noteIdToUpdate ? "Note Updated (Mock)" : "Note Added (Mock)", description: "This is a mock action."});
    if (noteIdToUpdate) {
        setProgressNotes(prev => prev.map(n => n.id === noteIdToUpdate ? { ...n, ...noteData, id: noteIdToUpdate, patientId, images: noteData.images || n.images } : n));
    } else {
        const newNote = { ...noteData, id: `pn_mock_${Date.now()}`, patientId, images: noteData.images || [] };
        setProgressNotes(prev => [...prev, newNote]);
    }
  };

  const handleDeleteProgressNote = async (noteId: string) => {
    // Mock implementation
    toast({ title: "Note Deleted (Mock)", variant: "destructive"});
    setProgressNotes(prev => prev.filter(n => n.id !== noteId));
  };


  return (
    <div className="space-y-6">
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-muted/30 p-6 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${patient.name.charAt(0)}`} alt={patient.name} data-ai-hint="avatar person" />
            <AvatarFallback className="text-2xl">{patient.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <CardTitle className="text-3xl">{patient.name}</CardTitle>
            <CardDescription className="text-md mt-1">
              DOB: {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'} | Phone: {patient.phone || 'N/A'} | Email: {patient.email}
            </CardDescription>
          </div>
          <Link href={`/doctor/patients/${patientId}/edit`} passHref>
            <Button variant="outline" className="w-full sm:w-auto"><Edit3 className="mr-2 h-4 w-4" /> Edit Patient Info</Button>
          </Link>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="treatment-plans"><ClipboardListIcon className="mr-2 h-4 w-4" />Treatment Plans</TabsTrigger>
          <TabsTrigger value="progress-notes"><FileTextIcon className="mr-2 h-4 w-4" />Progress Notes</TabsTrigger>
          <TabsTrigger value="appointments"><CalendarIcon className="mr-2 h-4 w-4" />Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="treatment-plans">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Treatment Plans</CardTitle>
                <CardDescription>Manage and view patient's treatment plans.</CardDescription>
              </div>
              <DialogAddEditTreatmentPlan 
                patientId={patientId} 
                onSave={handleAddOrUpdateTreatmentPlan}
                doctors={mockStaff.filter(s => s.role === 'Dentist' || s.role === 'Hygienist')}
              />
            </CardHeader>
            <CardContent>
              {treatmentPlans.length > 0 ? (
                <div className="space-y-4">
                {treatmentPlans.map(plan => (
                  <Card key={plan.id} className="shadow-md">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{plan.title}</CardTitle>
                          <Badge variant={plan.status === 'Active' ? 'default' : 'secondary'} className="mt-1">{plan.status}</Badge>
                        </div>
                        <div className="flex space-x-2">
                           <DialogAddEditTreatmentPlan 
                            plan={plan} 
                            patientId={patientId} 
                            onSave={handleAddOrUpdateTreatmentPlan}
                            doctors={mockStaff.filter(s => s.role === 'Dentist' || s.role === 'Hygienist')}
                           />
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteTreatmentPlan(plan.id)}><Trash2 className="h-4 w-4"/></Button>
                        </div>
                      </div>
                      <CardDescription>
                        Start: {new Date(plan.startDate).toLocaleDateString()} | By: Dr. {mockStaff.find(s => s.id === plan.doctorId)?.name || 'N/A'} | Cost: ${plan.totalCost?.toFixed(2) || 'N/A'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold mb-1">Procedures:</h4>
                      {plan.procedures.length > 0 ? (
                        <ul className="list-disc pl-5 text-sm text-muted-foreground">
                          {plan.procedures.map(proc => <li key={proc.id}>{proc.name} (${proc.cost?.toFixed(2) || 'N/A'})</li>)}
                        </ul>
                      ) : <p className="text-sm text-muted-foreground">No procedures listed.</p>}
                      {plan.notes && <p className="mt-2 text-sm"><strong>Notes:</strong> {plan.notes}</p>}
                    </CardContent>
                  </Card>
                ))}
                </div>
              ) : <p className="text-muted-foreground">No treatment plans found.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress-notes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Progress Notes</CardTitle>
                <CardDescription>Record and review patient progress.</CardDescription>
              </div>
              <DialogAddEditProgressNote 
                patientId={patientId} 
                onSave={handleAddOrUpdateProgressNote}
                doctors={mockStaff.filter(s => s.role === 'Dentist' || s.role === 'Hygienist')}
                treatmentPlans={treatmentPlans}
              />
            </CardHeader>
            <CardContent>
            {progressNotes.length > 0 ? (
                <div className="space-y-4">
                {progressNotes.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(note => (
                  <Card key={note.id} className="shadow-md">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Note on {new Date(note.date).toLocaleDateString()} at {note.time}</CardTitle>
                          {note.progressStage && <Badge variant="outline" className="mt-1">{note.progressStage}</Badge>}
                        </div>
                        <div className="flex space-x-2">
                          <DialogAddEditProgressNote 
                            note={note} 
                            patientId={patientId} 
                            onSave={handleAddOrUpdateProgressNote}
                            doctors={mockStaff.filter(s => s.role === 'Dentist' || s.role === 'Hygienist')}
                            treatmentPlans={treatmentPlans}
                          />
                           <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteProgressNote(note.id)}><Trash2 className="h-4 w-4"/></Button>
                        </div>
                      </div>
                     <CardDescription>By: Dr. {mockStaff.find(s => s.id === note.doctorId)?.name || 'Unknown'} {note.treatmentPlanId ? `(Plan: ${treatmentPlans.find(tp=>tp.id === note.treatmentPlanId)?.title || 'N/A'})` : ''}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                      {note.images && note.images.length > 0 && (
                        <div className="mt-3">
                          <h4 className="font-semibold text-xs mb-1">Attached Images:</h4>
                          <div className="flex space-x-2 overflow-x-auto pb-2">
                            {note.images.map(img => (
                              <div key={img.id} className="flex-shrink-0 group relative">
                                <Image src={img.url} alt={img.caption || 'Progress image'} width={100} height={100} className="rounded object-cover border" data-ai-hint="medical x-ray"/>
                                {img.caption && <p className="text-xs text-center mt-1 max-w-[100px] truncate">{img.caption}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                </div>
              ) : <p className="text-muted-foreground">No progress notes found.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>View past and upcoming appointments for {patient.name}.</CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(apt => (
                      <TableRow key={apt.id} className={apt.id === routerAppointmentId ? 'bg-accent/50' : ''}>
                        <TableCell>{new Date(apt.date).toLocaleDateString()}</TableCell>
                        <TableCell>{apt.time}</TableCell>
                        <TableCell>{apt.type}</TableCell>
                        <TableCell>{apt.doctorName || mockStaff.find(s => s.id === apt.doctorId)?.name}</TableCell>
                        <TableCell><Badge variant={apt.status === 'Completed' || apt.status === 'Confirmed' ? 'default' : 'secondary'}>{apt.status}</Badge></TableCell>
                        <TableCell className="text-right space-x-1">
                          {apt.status === 'Scheduled' && <Button variant="outline" size="sm">Confirm</Button>}
                          {apt.status !== 'Completed' && apt.status !== 'Cancelled' && <Button variant="outline" size="sm">Reschedule</Button>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <p className="text-muted-foreground">No appointments found.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Dialog for Adding/Editing Treatment Plan
interface DialogAddEditTreatmentPlanProps {
  plan?: TreatmentPlan;
  patientId: string;
  onSave: (data: Omit<TreatmentPlan, 'id' | 'patientId'>, planIdToUpdate?: string) => Promise<void>;
  doctors: { id: string; name: string }[];
}

function DialogAddEditTreatmentPlan({ plan, patientId, onSave, doctors }: DialogAddEditTreatmentPlanProps) {
  const isEditMode = !!plan;
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState(plan?.title || '');
  const [doctorId, setDoctorId] = useState(plan?.doctorId || '');
  const [startDate, setStartDate] = useState(plan?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(plan?.endDate || '');
  const [status, setStatus] = useState<TreatmentPlan['status']>(plan?.status || 'Active');
  const [proceduresStr, setProceduresStr] = useState(plan?.procedures.map(p => `${p.name} - $${p.cost || 0}`).join('\n') || '');
  const [notes, setNotes] = useState(plan?.notes || '');
  const [totalCostStr, setTotalCostStr] = useState(plan?.totalCost?.toString() || '');

  useEffect(() => {
    if (plan) {
      setTitle(plan.title);
      setDoctorId(plan.doctorId);
      setStartDate(plan.startDate);
      setEndDate(plan.endDate || '');
      setStatus(plan.status);
      setProceduresStr(plan.procedures.map(p => `${p.name} - $${p.cost || 0}`).join('\n'));
      setNotes(plan.notes || '');
      setTotalCostStr(plan.totalCost?.toString() || '');
    } else {
      // Reset for new plan
      setTitle(''); setDoctorId(''); setStartDate(new Date().toISOString().split('T')[0]); setEndDate('');
      setStatus('Active'); setProceduresStr(''); setNotes(''); setTotalCostStr('');
    }
  }, [plan, isOpen]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const procedures: Procedure[] = proceduresStr.split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .map((line, index) => {
        const parts = line.split(' - $');
        return {
          id: `proc_temp_${index}`, // Temporary ID
          name: parts[0]?.trim(),
          cost: parseFloat(parts[1]) || 0,
        };
      });
    
    const calculatedTotalCost = procedures.reduce((sum, p) => sum + (p.cost || 0), 0);
    const finalTotalCost = totalCostStr ? parseFloat(totalCostStr) : calculatedTotalCost;

    const planData: Omit<TreatmentPlan, 'id' | 'patientId'> = {
      title, doctorId, startDate, endDate: endDate || undefined, status, procedures, notes, totalCost: finalTotalCost,
    };

    try {
      await onSave(planData, plan?.id);
      setIsOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={isEditMode ? "ghost" : "default"} size={isEditMode ? "icon" : "default"}>
          {isEditMode ? <Edit3 className="h-4 w-4" /> : <><PlusCircle className="mr-2 h-4 w-4" /> Add Plan</>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit" : "Add New"} Treatment Plan</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Modify the details of the existing treatment plan." : "Create a new treatment plan for the patient."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-1">
              <Label htmlFor="tp-title">Title</Label>
              <Input id="tp-title" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tp-doctor">Doctor</Label>
              <Select value={doctorId} onValueChange={setDoctorId} required>
                <SelectTrigger id="tp-doctor"><SelectValue placeholder="Select doctor" /></SelectTrigger>
                <SelectContent>
                  {doctors.map(doc => <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                <Label htmlFor="tp-start-date">Start Date</Label>
                <Input id="tp-start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div className="space-y-1">
                <Label htmlFor="tp-end-date">End Date (Optional)</Label>
                <Input id="tp-end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="tp-procedures">Procedures (Name - $Cost, one per line)</Label>
              <Textarea id="tp-procedures" value={proceduresStr} onChange={e => setProceduresStr(e.target.value)} rows={3} placeholder="e.g., Teeth Cleaning - $120&#10;X-Ray - $80" />
            </div>
             <div className="space-y-1">
              <Label htmlFor="tp-total-cost">Total Cost (auto-calculates if blank)</Label>
              <Input id="tp-total-cost" type="number" value={totalCostStr} onChange={e => setTotalCostStr(e.target.value)} placeholder="e.g., 200.00" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tp-status">Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as TreatmentPlan['status'])} required>
                  <SelectTrigger id="tp-status"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="tp-notes">Notes (Optional)</Label>
              <Textarea id="tp-notes" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isEditMode ? "Save Changes" : "Create Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


// Dialog for Adding/Editing Progress Note
interface DialogAddEditProgressNoteProps {
  note?: ProgressNote;
  patientId: string;
  onSave: (data: Omit<ProgressNote, 'id' | 'patientId' | 'images'> & { images?: ProgressNote['images'] }, noteIdToUpdate?: string) => Promise<void>;
  doctors: { id: string; name: string }[];
  treatmentPlans: TreatmentPlan[]; // To link note to a plan
}

function DialogAddEditProgressNote({ note, patientId, onSave, doctors, treatmentPlans }: DialogAddEditProgressNoteProps) {
  const isEditMode = !!note;
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [doctorId, setDoctorId] = useState(note?.doctorId || '');
  const [treatmentPlanId, setTreatmentPlanId] = useState(note?.treatmentPlanId || '');
  const [date, setDate] = useState(note?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(note?.time || new Date().toTimeString().split(' ')[0].substring(0,5));
  const [noteContent, setNoteContent] = useState(note?.note || '');
  const [progressStage, setProgressStage] = useState(note?.progressStage || '');
  const [currentImages, setCurrentImages] = useState<ProgressNote['images']>(note?.images || []);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);


  useEffect(() => {
    if (note) {
        setDoctorId(note.doctorId);
        setTreatmentPlanId(note.treatmentPlanId || '');
        setDate(note.date);
        setTime(note.time);
        setNoteContent(note.note);
        setProgressStage(note.progressStage || '');
        setCurrentImages(note.images || []);
    } else {
        // Reset for new note
        setDoctorId(''); setTreatmentPlanId(''); setDate(new Date().toISOString().split('T')[0]);
        setTime(new Date().toTimeString().split(' ')[0].substring(0,5));
        setNoteContent(''); setProgressStage(''); setCurrentImages([]);
    }
    setSelectedFiles([]); // Always clear file input on open/re-render
  }, [note, isOpen]);


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleImageUploadAndPrepare = async (): Promise<ProgressNote['images']> => {
    if (selectedFiles.length === 0) return currentImages; // No new files to upload

    const uploadedUrls: { id: string, url: string, caption?: string }[] = [];
    // Mock upload
    for (const file of selectedFiles) {
        // In a real app, upload to GCS or similar and get URL
        // For mock, create a blob URL or use a placeholder
        const mockUrl = URL.createObjectURL(file); // Temporary URL for preview
        uploadedUrls.push({ id: `img_mock_${Date.now()}_${file.name}`, url: mockUrl, caption: file.name });
         toast({ title: "Mock Upload", description: `Simulated upload of ${file.name}` });
    }
    return [...currentImages, ...uploadedUrls];
  };
  
  const removeSelectedImage = (urlToRemove: string) => {
    // This would remove from currentImages if it's an existing one,
    // or from a temporary list of newly staged images if UI allows.
    // For simplicity, if URL is a blob, revoke it.
    if(urlToRemove.startsWith('blob:')) URL.revokeObjectURL(urlToRemove);
    setCurrentImages(prev => prev.filter(img => img.url !== urlToRemove));
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalImages = await handleImageUploadAndPrepare();

    const noteData: Omit<ProgressNote, 'id' | 'patientId' | 'images'> & { images?: ProgressNote['images'] } = {
      doctorId, treatmentPlanId: treatmentPlanId || undefined, date, time, note: noteContent, progressStage: progressStage || undefined,
      images: finalImages,
    };

    try {
      await onSave(noteData, note?.id);
      setIsOpen(false); // Close dialog on success
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={isEditMode ? "ghost" : "default"} size={isEditMode ? "icon" : "default"}>
           {isEditMode ? <Edit3 className="h-4 w-4" /> : <><PlusCircle className="mr-2 h-4 w-4" /> Add Note</>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit" : "Add New"} Progress Note</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update the progress note details." : "Add a new progress note for the patient."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-1">
                <Label htmlFor="pn-doctor">Doctor</Label>
                <Select value={doctorId} onValueChange={setDoctorId} required>
                    <SelectTrigger id="pn-doctor"><SelectValue placeholder="Select doctor" /></SelectTrigger>
                    <SelectContent>{doctors.map(doc => <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label htmlFor="pn-plan">Treatment Plan (Optional)</Label>
                <Select value={treatmentPlanId} onValueChange={setTreatmentPlanId}>
                    <SelectTrigger id="pn-plan"><SelectValue placeholder="Link to treatment plan" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {treatmentPlans.map(tp => <SelectItem key={tp.id} value={tp.id}>{tp.title}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="pn-date">Date</Label>
                    <Input id="pn-date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="pn-time">Time</Label>
                    <Input id="pn-time" type="time" value={time} onChange={e => setTime(e.target.value)} required />
                </div>
            </div>
            <div className="space-y-1">
                <Label htmlFor="pn-note">Note Content</Label>
                <Textarea id="pn-note" value={noteContent} onChange={e => setNoteContent(e.target.value)} rows={5} required />
            </div>
            <div className="space-y-1">
                <Label htmlFor="pn-stage">Progress Stage (Optional)</Label>
                <Input id="pn-stage" value={progressStage} onChange={e => setProgressStage(e.target.value)} placeholder="e.g., Post-Op Day 3, Phase 1 Complete" />
            </div>
            <div className="space-y-1">
                <Label htmlFor="pn-images">Attach Images</Label>
                <Input id="pn-images" type="file" multiple onChange={handleFileChange} accept="image/*" />
            </div>
            {(currentImages.length > 0 || selectedFiles.length > 0) && (
                <div className="col-span-4">
                    <Label className="text-sm font-medium">Images:</Label>
                    <div className="flex flex-wrap gap-2 mt-1 overflow-x-auto pb-2">
                    {currentImages.map(img => (
                        <div key={img.id || img.url} className="relative group w-20 h-20 flex-shrink-0">
                        <Image src={img.url} alt={img.caption || 'Progress image'} width={80} height={80} className="rounded object-cover border" data-ai-hint="medical scan"/>
                        <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 z-10" onClick={() => removeSelectedImage(img.url)}><Trash2 className="h-3 w-3"/></Button>
                        </div>
                    ))}
                    {selectedFiles.map((file, index) => ( // Preview newly selected files
                        <div key={index} className="relative group w-20 h-20 flex-shrink-0">
                         <Image src={URL.createObjectURL(file)} alt={file.name} width={80} height={80} className="rounded object-cover border" data-ai-hint="medical scan"/>
                         {/* Add a way to remove newly selected files before upload if needed */}
                        </div>
                    ))}
                    </div>
                </div>
            )}
          </div>
          <DialogFooter className="pt-4">
             <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isEditMode ? "Save Changes" : "Add Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

