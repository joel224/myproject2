
'use client'

import { mockPatients, mockAppointments, mockTreatmentPlans, mockProgressNotes, mockStaff } from '@/lib/mockData';
import type { TreatmentPlan, ProgressNote } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, FileTextIcon, ClipboardListIcon, Edit3, PlusCircle, Image as ImageIcon, Trash2 } from 'lucide-react'; // Renamed Image to ImageIcon to avoid conflict
import Image from 'next/image'; // Next.js Image component
import Link from 'next/link'; // Import Link
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface PatientPageProps {
  params: { patientId: string };
}

export default function PatientDetailPage({ params: { patientId } }: PatientPageProps) {
  const patient = mockPatients.find(p => p.id === patientId);
  const appointments = mockAppointments.filter(a => a.patientId === patientId);
  const treatmentPlans = mockTreatmentPlans.filter(tp => tp.patientId === patientId);
  const progressNotes = mockProgressNotes.filter(pn => pn.patientId === patientId);

  if (!patient) {
    return <div className="container mx-auto p-4">Patient not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-muted/30 p-6 flex flex-row items-center space-x-4">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${patient.name.charAt(0)}`} alt={patient.name} data-ai-hint="avatar person" />
            <AvatarFallback className="text-2xl">{patient.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-3xl">{patient.name}</CardTitle>
            <CardDescription className="text-md">
              DOB: {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'} | Phone: {patient.phone || 'N/A'} | Email: {patient.email}
            </CardDescription>
          </div>
          <Link href={`/doctor/patients/${patientId}/edit`} passHref>
            <Button variant="outline" className="ml-auto"><Edit3 className="mr-2 h-4 w-4" /> Edit Patient Info</Button>
          </Link>
        </CardHeader>
      </Card>

      <Tabs defaultValue="treatment-plans">
        <TabsList className="grid w-full grid-cols-3">
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
              <DialogAddEditTreatmentPlan patientId={patientId} />
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
                          <DialogAddEditTreatmentPlan plan={plan} patientId={patientId} />
                          <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4"/></Button>
                        </div>
                      </div>
                      <CardDescription>Start Date: {new Date(plan.startDate).toLocaleDateString()} - Total Cost: ${plan.totalCost || 'N/A'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold mb-1">Procedures:</h4>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        {plan.procedures.map(proc => <li key={proc.id}>{proc.name} (${proc.cost})</li>)}
                      </ul>
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
              <DialogAddEditProgressNote patientId={patientId} />
            </CardHeader>
            <CardContent>
            {progressNotes.length > 0 ? (
                <div className="space-y-4">
                {progressNotes.map(note => (
                  <Card key={note.id} className="shadow-md">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Note on {new Date(note.date).toLocaleDateString()} at {note.time}</CardTitle>
                          {note.progressStage && <Badge variant="outline" className="mt-1">{note.progressStage}</Badge>}
                        </div>
                        <div className="flex space-x-2">
                          <DialogAddEditProgressNote note={note} patientId={patientId} />
                           <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4"/></Button>
                        </div>
                      </div>
                     <CardDescription>By: Dr. {mockStaff.find(s => s.id === note.doctorId)?.name || 'Unknown'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                      {note.images && note.images.length > 0 && (
                        <div className="mt-3">
                          <h4 className="font-semibold text-xs mb-1">Attached Images:</h4>
                          <div className="flex space-x-2 overflow-x-auto">
                            {note.images.map(img => (
                              <div key={img.id} className="flex-shrink-0">
                                <Image src={img.url} alt={img.caption || 'Progress image'} width={100} height={100} className="rounded object-cover" data-ai-hint="medical x-ray"/>
                                {img.caption && <p className="text-xs text-center mt-1">{img.caption}</p>}
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
                      <TableRow key={apt.id}>
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


function DialogAddEditTreatmentPlan({ plan, patientId }: { plan?: TreatmentPlan, patientId: string }) {
  const isEditMode = !!plan;
  // TODO: Implement form state and submission logic
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={isEditMode ? "ghost" : "default"} size={isEditMode ? "icon" : "default"}>
          {isEditMode ? <Edit3 className="h-4 w-4" /> : <><PlusCircle className="mr-2 h-4 w-4" /> Add Plan</>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit" : "Add New"} Treatment Plan</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Modify the details of the existing treatment plan." : "Create a new treatment plan for the patient."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tp-title" className="text-right">Title</Label>
            <Input id="tp-title" defaultValue={plan?.title} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tp-start-date" className="text-right">Start Date</Label>
            <Input id="tp-start-date" type="date" defaultValue={plan?.startDate} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tp-procedures" className="text-right">Procedures</Label>
            <Textarea id="tp-procedures" placeholder="List procedures, one per line (e.g., Cleaning - $100)" defaultValue={plan?.procedures.map(p => `${p.name} - $${p.cost}`).join('\n')} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tp-status" className="text-right">Status</Label>
             <Select defaultValue={plan?.status || "Active"}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tp-notes" className="text-right">Notes</Label>
            <Textarea id="tp-notes" defaultValue={plan?.notes} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">{isEditMode ? "Save Changes" : "Create Plan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DialogAddEditProgressNote({ note, patientId }: { note?: ProgressNote, patientId: string }) {
  const isEditMode = !!note;
  // TODO: Implement form state and submission logic for progress notes
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={isEditMode ? "ghost" : "default"} size={isEditMode ? "icon" : "default"}>
           {isEditMode ? <Edit3 className="h-4 w-4" /> : <><PlusCircle className="mr-2 h-4 w-4" /> Add Note</>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit" : "Add New"} Progress Note</DialogTitle>
          <DialogDescription>
             {isEditMode ? "Update the progress note details." : "Add a new progress note for the patient."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pn-date" className="text-right">Date</Label>
            <Input id="pn-date" type="date" defaultValue={note?.date || new Date().toISOString().split('T')[0]} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pn-time" className="text-right">Time</Label>
            <Input id="pn-time" type="time" defaultValue={note?.time || new Date().toTimeString().split(' ')[0].substring(0,5)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pn-note" className="text-right">Note</Label>
            <Textarea id="pn-note" defaultValue={note?.note} className="col-span-3" rows={5} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pn-stage" className="text-right">Progress Stage</Label>
            <Input id="pn-stage" defaultValue={note?.progressStage} placeholder="e.g., Post-Op Day 3" className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pn-images" className="text-right">Images</Label>
            <Input id="pn-images" type="file" multiple className="col-span-3" />
          </div>
          {isEditMode && note?.images && note.images.length > 0 && (
             <div className="col-span-4">
                <Label className="text-sm font-medium">Current Images:</Label>
                <div className="flex space-x-2 mt-1 overflow-x-auto">
                  {note.images.map(img => (
                    <div key={img.id} className="relative group flex-shrink-0">
                      <Image src={img.url} alt={img.caption || 'Progress image'} width={80} height={80} className="rounded object-cover" data-ai-hint="medical scan"/>
                      <Button variant="destructive" size="icon" className="absolute top-0 right-0 h-5 w-5 opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3"/></Button>
                    </div>
                  ))}
                </div>
             </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit">{isEditMode ? "Save Changes" : "Add Note"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
