
'use client'

import type { TreatmentPlan, ProgressNote, Procedure, Appointment, Patient, StaffMember } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, FileTextIcon, ClipboardListIcon, Edit3, PlusCircle, Image as ImageIcon, Trash2, DollarSign, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent, ChangeEvent, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.patientId as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const routerAppointmentId = searchParams.get('appointment');
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  
  const [activeTab, setActiveTab] = useState('treatment-plans');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch patient data
      const patientRes = await fetch(`/api/patients/${patientId}`);
      if (!patientRes.ok) {
        const errData = await patientRes.json();
        throw new Error(errData.message || `Failed to fetch patient (status: ${patientRes.status})`);
      }
      const patientData: Patient = await patientRes.json();
      setPatient(patientData);

      // Fetch related data
      const [appointmentsRes, treatmentPlansRes, progressNotesRes, staffRes] = await Promise.all([
        fetch(`/api/appointments?patientId=${patientId}`),
        fetch(`/api/patients/${patientId}/treatment-plans`),
        fetch(`/api/patients/${patientId}/progress-notes`),
        fetch(`/api/staff?role=Dentist&role=Hygienist`) // Fetch doctors/hygienists
      ]);

      if (!appointmentsRes.ok) throw new Error('Failed to fetch appointments');
      setAppointments(await appointmentsRes.json());

      if (!treatmentPlansRes.ok) throw new Error('Failed to fetch treatment plans');
      setTreatmentPlans(await treatmentPlansRes.json());

      if (!progressNotesRes.ok) throw new Error('Failed to fetch progress notes');
      setProgressNotes(await progressNotesRes.json());

      if (!staffRes.ok) throw new Error('Failed to fetch staff list');
      setStaffList(await staffRes.json());


      if (routerAppointmentId) {
        setActiveTab('appointments');
      }

    } catch (err: any) {
      console.error("Error fetching patient data:", err);
      setError(err.message || "An unexpected error occurred.");
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [patientId, toast, routerAppointmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // CRUD Handlers - Call fetchData() on success to refresh
  const handleAddOrUpdateTreatmentPlan = async (planData: Omit<TreatmentPlan, 'id' | 'patientId'>, planIdToUpdate?: string) => {
    const url = planIdToUpdate ? `/api/treatment-plans/${planIdToUpdate}` : `/api/patients/${patientId}/treatment-plans`;
    const method = planIdToUpdate ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planIdToUpdate ? planData : { ...planData, patientId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to save treatment plan');
      toast({ title: planIdToUpdate ? "Plan Updated" : "Plan Added", description: result.title });
      fetchData(); // Refresh all data
      return true;
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
      return false;
    }
  };

  const handleDeleteTreatmentPlan = async (planId: string) => {
    try {
      const response = await fetch(`/api/treatment-plans/${planId}`, { method: 'DELETE' });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to delete treatment plan');
      }
      toast({ title: "Plan Deleted", variant: "default" });
      fetchData(); // Refresh
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const handleAddOrUpdateProgressNote = async (noteData: Omit<ProgressNote, 'id' | 'patientId'>, noteIdToUpdate?: string) => {
    const url = noteIdToUpdate ? `/api/progress-notes/${noteIdToUpdate}` : `/api/patients/${patientId}/progress-notes`;
    const method = noteIdToUpdate ? 'PUT' : 'POST';

    // Mock image upload for now if files are present
    if (noteData.images && Array.isArray(noteData.images)) {
        // In a real app, upload images first, then use returned URLs
        // For mock, we'll assume URLs are already provided if they exist or handled by API directly
    }
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteIdToUpdate ? noteData : { ...noteData, patientId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to save progress note');
      toast({ title: noteIdToUpdate ? "Note Updated" : "Note Added", description: `Note from ${result.date}` });
      fetchData(); // Refresh
      return true;
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
      return false;
    }
  };

  const handleDeleteProgressNote = async (noteId: string) => {
     try {
      const response = await fetch(`/api/progress-notes/${noteId}`, { method: 'DELETE' });
      if (!response.ok) {
         const result = await response.json();
        throw new Error(result.message || 'Failed to delete progress note');
      }
      toast({ title: "Note Deleted", variant: "default"});
      fetchData(); // Refresh
    } catch (err: any)
      {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading patient details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <AlertTriangle className="h-12 w-12 mb-2" />
        <p className="text-lg">{error}</p>
        <Button onClick={() => router.push('/doctor/patients')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient List
        </Button>
      </div>
    );
  }
  
  if (!patient) {
    // This case should ideally be covered by the error state if fetch fails.
    // If fetch succeeds but patient is null (e.g., API returns 200 with null for some reason), handle it.
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="h-12 w-12 mb-2 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Patient data could not be loaded.</p>
         <Button onClick={() => router.push('/doctor/patients')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient List
        </Button>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-muted/30 p-6 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${patient.name.charAt(0)}`} alt={patient.name} data-ai-hint="avatar person"/>
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
                doctors={staffList} // Use fetched staff list
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
                            doctors={staffList} // Use fetched staff list
                           />
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteTreatmentPlan(plan.id)}><Trash2 className="h-4 w-4"/></Button>
                        </div>
                      </div>
                      <CardDescription>
                        Start: {new Date(plan.startDate).toLocaleDateString()} | By: {staffList.find(s => s.id === plan.doctorId)?.name || 'N/A'} | Cost: ${plan.totalCost?.toFixed(2) || 'N/A'}
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
                doctors={staffList} // Use fetched staff list
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
                            doctors={staffList} // Use fetched staff list
                            treatmentPlans={treatmentPlans}
                          />
                           <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteProgressNote(note.id)}><Trash2 className="h-4 w-4"/></Button>
                        </div>
                      </div>
                     <CardDescription>By: {staffList.find(s => s.id === note.doctorId)?.name || 'Unknown'} {note.treatmentPlanId ? `(Plan: ${treatmentPlans.find(tp=>tp.id === note.treatmentPlanId)?.title || 'N/A'})` : ''}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                      {note.images && note.images.length > 0 && (
                        <div className="mt-3">
                          <h4 className="font-semibold text-xs mb-1">Attached Images:</h4>
                          <div className="flex space-x-2 overflow-x-auto pb-2">
                            {note.images.map(img => (
                              <div key={img.id} className="flex-shrink-0 group relative">
                                <Image src={img.url} alt={img.caption || 'Progress image'} width={100} height={100} className="rounded object-cover border" data-ai-hint="medical scan"/>
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
                        <TableCell>{apt.doctorName || staffList.find(s => s.id === apt.doctorId)?.name || 'N/A'}</TableCell>
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
  onSave: (data: Omit<TreatmentPlan, 'id' | 'patientId'>, planIdToUpdate?: string) => Promise<boolean>;
  doctors: StaffMember[]; // Changed from simple object to StaffMember type
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
    if (isOpen) { // Reset form when dialog opens
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
            setTitle(''); setDoctorId(''); setStartDate(new Date().toISOString().split('T')[0]); setEndDate('');
            setStatus('Active'); setProceduresStr(''); setNotes(''); setTotalCostStr('');
        }
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
          id: plan?.procedures?.[index]?.id || `proc_temp_${Date.now()}_${index}`, // Keep existing ID if editing
          name: parts[0]?.trim() || `Unnamed Procedure ${index + 1}`,
          cost: parseFloat(parts[1]) || 0,
        };
      });
    
    const calculatedTotalCost = procedures.reduce((sum, p) => sum + (p.cost || 0), 0);
    const finalTotalCost = totalCostStr ? parseFloat(totalCostStr) : calculatedTotalCost;

    const planData: Omit<TreatmentPlan, 'id' | 'patientId'> = {
      title, doctorId, startDate, endDate: endDate || undefined, status, procedures, notes, totalCost: finalTotalCost,
    };

    const success = await onSave(planData, plan?.id);
    if (success) {
        setIsOpen(false);
    }
    setIsSubmitting(false);
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
                  {doctors.map(doc => <SelectItem key={doc.id} value={doc.id}>{doc.name} ({doc.role})</SelectItem>)}
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
  onSave: (data: Omit<ProgressNote, 'id' | 'patientId'>, noteIdToUpdate?: string) => Promise<boolean>;
  doctors: StaffMember[];
  treatmentPlans: TreatmentPlan[];
}

function DialogAddEditProgressNote({ note, patientId, onSave, doctors, treatmentPlans }: DialogAddEditProgressNoteProps) {
  const isEditMode = !!note;
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [doctorId, setDoctorId] = useState(note?.doctorId || '');
  const [treatmentPlanId, setTreatmentPlanId] = useState(note?.treatmentPlanId || '');
  const [date, setDate] = useState(note?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(note?.time || new Date().toTimeString().split(' ')[0].substring(0,5));
  const [noteContent, setNoteContent] = useState(note?.note || '');
  const [progressStage, setProgressStage] = useState(note?.progressStage || '');
  
  const [existingImages, setExistingImages] = useState<ProgressNote['images']>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);


  useEffect(() => {
    if (isOpen) { // Reset form state when dialog opens
        if (note) {
            setDoctorId(note.doctorId);
            setTreatmentPlanId(note.treatmentPlanId || '');
            setDate(note.date);
            setTime(note.time);
            setNoteContent(note.note);
            setProgressStage(note.progressStage || '');
            setExistingImages(note.images || []);
        } else {
            setDoctorId(''); setTreatmentPlanId(''); setDate(new Date().toISOString().split('T')[0]);
            setTime(new Date().toTimeString().split(' ')[0].substring(0,5));
            setNoteContent(''); setProgressStage(''); setExistingImages([]);
        }
        setNewFiles([]); // Clear any previously selected new files
        if (imageInputRef.current) imageInputRef.current.value = ''; // Reset file input
    }
  }, [note, isOpen]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles(Array.from(e.target.files));
    }
  };

  const removeExistingImage = (imageToRemove: ProgressNoteImage) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageToRemove.id));
  };

  const removeNewFile = (fileToRemove: File) => {
    setNewFiles(prev => prev.filter(file => file !== fileToRemove));
    if (imageInputRef.current) imageInputRef.current.value = '';
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let uploadedImageUrls: ProgressNote['images'] = [...existingImages];

    if (newFiles.length > 0) {
        // Simulate file upload: In a real app, upload files to GCS or similar, then get URLs
        for (const file of newFiles) {
            const formData = new FormData();
            formData.append('imageFile', file);
            try {
                const res = await fetch('/api/upload/image', { method: 'POST', body: formData });
                const uploadResult = await res.json();
                if (!res.ok) throw new Error(uploadResult.message || `Upload failed for ${file.name}`);
                uploadedImageUrls.push({ id: uploadResult.fileName, url: uploadResult.imageUrl, caption: file.name });
            } catch (uploadError: any) {
                toast({ variant: "destructive", title: "Image Upload Error", description: uploadError.message });
                setIsSubmitting(false);
                return;
            }
        }
    }
    
    const noteData = {
      doctorId, 
      treatmentPlanId: treatmentPlanId || undefined, 
      date, 
      time, 
      note: noteContent, 
      progressStage: progressStage || undefined,
      images: uploadedImageUrls,
    };

    const success = await onSave(noteData, note?.id);
    if (success) {
        setIsOpen(false);
    }
    setIsSubmitting(false);
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
                    <SelectContent>{doctors.map(doc => <SelectItem key={doc.id} value={doc.id}>{doc.name} ({doc.role})</SelectItem>)}</SelectContent>
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
            <div className="space-y-2">
                <Label htmlFor="pn-images-upload">Attach New Images/PDFs</Label>
                <Input id="pn-images-upload" type="file" multiple onChange={handleFileChange} accept="image/*,application/pdf" ref={imageInputRef} />
            </div>
            
            { (existingImages.length > 0 || newFiles.length > 0) && (
                <div>
                    <Label className="text-sm font-medium">Attachments:</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {existingImages.map(img => (
                            <div key={img.id} className="relative group w-20 h-20">
                                {img.url.toLowerCase().endsWith('.pdf') ? <FileText className="h-16 w-16 text-destructive"/> : <Image src={img.url} alt={img.caption || 'Existing image'} width={80} height={80} className="rounded object-cover border" data-ai-hint="medical scan"/>}
                                <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => removeExistingImage(img)}><Trash2 className="h-3 w-3"/></Button>
                            </div>
                        ))}
                        {newFiles.map((file, index) => (
                            <div key={index} className="relative group w-20 h-20">
                                {file.type.startsWith('image/') ? <Image src={URL.createObjectURL(file)} alt={file.name} width={80} height={80} className="rounded object-cover border" data-ai-hint="medical scan"/> : <FileText className="h-16 w-16 text-muted-foreground"/>}
                                <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => removeNewFile(file)}><Trash2 className="h-3 w-3"/></Button>
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
