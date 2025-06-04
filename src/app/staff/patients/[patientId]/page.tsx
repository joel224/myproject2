
// src/app/staff/patients/[patientId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertTriangle, Edit3, ArrowLeft, FileText, ShieldAlert, HeartPulse, Droplets, Info, Wind } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Patient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function StaffPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientId) {
      const fetchPatientData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/patients/${patientId}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch patient data');
          }
          const data: Patient = await response.json();
          setPatient(data);
        } catch (err: any) {
          setError(err.message);
          toast({ variant: "destructive", title: "Error", description: "Could not load patient details." });
        } finally {
          setIsLoading(false);
        }
      };
      fetchPatientData();
    }
  }, [patientId, toast]);

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
        <Button onClick={() => router.push('/staff/patients')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient List
        </Button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="h-12 w-12 mb-2 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Patient not found.</p>
        <Button onClick={() => router.push('/staff/patients')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient List
        </Button>
      </div>
    );
  }

  const medicalConditions = [
    { label: 'Diabetes', value: patient.hasDiabetes, icon: <HeartPulse className="mr-2 h-5 w-5 text-red-500" /> },
    { label: 'High Blood Pressure', value: patient.hasHighBloodPressure, icon: <ShieldAlert className="mr-2 h-5 w-5 text-orange-500" /> },
    { label: 'Stroke/Heart Attack History', value: patient.hasStrokeOrHeartAttackHistory, icon: <HeartPulse className="mr-2 h-5 w-5 text-red-700" /> },
    { label: 'Bleeding Disorders', value: patient.hasBleedingDisorders, icon: <Droplets className="mr-2 h-5 w-5 text-blue-500" /> },
    { label: 'Allergies', value: patient.hasAllergy, specifics: patient.allergySpecifics, icon: <Info className="mr-2 h-5 w-5 text-yellow-500" /> },
    { label: 'Asthma/Respiratory Issues', value: patient.hasAsthma, icon: <Wind className="mr-2 h-5 w-5 text-green-500" /> },
  ].filter(condition => condition.value || (condition.label === 'Allergies' && condition.specifics));


  return (
    <div className="space-y-6 mb-12">
      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader className="bg-muted/30 p-6 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${patient.name.charAt(0)}`} alt={patient.name} data-ai-hint="avatar person" />
            <AvatarFallback className="text-3xl">{patient.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <CardTitle className="text-3xl">{patient.name}</CardTitle>
            <CardDescription className="text-md mt-1">Patient ID: {patient.id}</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => router.push('/staff/patients')} className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
            </Button>
            <Link href={`/staff/patients/${patient.id}/edit`} passHref>
              <Button className="w-full sm:w-auto"><Edit3 className="mr-2 h-4 w-4" /> Edit Patient Info</Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Personal Details Section */}
          <section>
            <h3 className="text-xl font-semibold mb-3 text-primary">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><Label className="font-medium text-muted-foreground">Email:</Label> <span className="text-foreground">{patient.email}</span></div>
              <div><Label className="font-medium text-muted-foreground">Phone:</Label> <span className="text-foreground">{patient.phone || 'N/A'}</span></div>
              <div><Label className="font-medium text-muted-foreground">Date of Birth:</Label> <span className="text-foreground">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</span></div>
              <div><Label className="font-medium text-muted-foreground">Age:</Label> <span className="text-foreground">{patient.age !== undefined ? patient.age : 'N/A'}</span></div>
            </div>
          </section>

          <Separator />

          {/* Medical Conditions Section */}
          {medicalConditions.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-3 text-primary">Medical Conditions</h3>
              <ul className="space-y-2">
                {medicalConditions.map(condition => (
                  <li key={condition.label} className="flex items-start p-2 bg-background rounded-md border">
                    {condition.icon}
                    <div>
                      <span className="font-medium text-foreground">{condition.label}</span>
                      {condition.label === 'Allergies' && condition.specifics && (
                        <p className="text-xs text-muted-foreground ml-7_comment_not_needed">Specifics: {condition.specifics}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
          
          {/* Medical Records/Notes Section */}
          {patient.medicalRecords && (
            <>
              <Separator />
              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">Medical Records / Notes</h3>
                <p className="text-sm text-foreground whitespace-pre-wrap p-3 bg-background rounded-md border">{patient.medicalRecords}</p>
              </section>
            </>
          )}

          {/* Attached Files Section */}
          {(patient.xrayImageUrls && patient.xrayImageUrls.length > 0) && (
            <>
              <Separator />
              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">Attached Files</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {patient.xrayImageUrls.map((url, index) => (
                    <Card key={index} className="overflow-hidden group">
                      <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`View attachment ${index + 1}`}>
                        <CardContent className="p-0 aspect-square flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors">
                          {url.toLowerCase().endsWith('.pdf') ? (
                            <FileText className="h-16 w-16 text-destructive" />
                          ) : (
                            <Image
                              src={url}
                              alt={`Attachment ${index + 1}`}
                              width={150}
                              height={150}
                              className="object-contain w-full h-full"
                              data-ai-hint="medical document scan"
                            />
                          )}
                        </CardContent>
                      </a>
                       <CardFooter className="p-1 text-xs text-center bg-background">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline w-full block">
                          Attachment {index + 1} {url.toLowerCase().endsWith('.pdf') ? '(PDF)' : '(Image)'}
                        </a>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </section>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
