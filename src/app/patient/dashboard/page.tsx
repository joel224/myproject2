
// src/app/patient/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import type { Patient } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, User, Mail, Phone, Calendar, Stethoscope, FileText, ShieldAlert, HeartPulse, Droplets, Info, Wind } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function PatientDashboardPage() {
  const [user, loadingAuth, authError] = useAuthState(auth);
  const [patientDetails, setPatientDetails] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loadingAuth) {
      return; // Wait until auth state is confirmed
    }
    if (!user) {
      setIsLoading(false);
      setError("You must be logged in to view this page.");
      return;
    }
    if (user && !patientDetails) {
      const fetchPatientDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const idToken = await user.getIdToken();
          const response = await fetch('/api/patient-profile', {
            headers: {
              'Authorization': `Bearer ${idToken}`,
            },
          });
          
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch patient details.');
          }
          setPatientDetails(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPatientDetails();
    }
  }, [user, loadingAuth, patientDetails]);

  const medicalConditions = patientDetails ? [
    { label: 'Diabetes', value: patientDetails.hasDiabetes, icon: <HeartPulse className="mr-2 h-5 w-5 text-red-500" /> },
    { label: 'High Blood Pressure', value: patientDetails.hasHighBloodPressure, icon: <ShieldAlert className="mr-2 h-5 w-5 text-orange-500" /> },
    { label: 'Stroke/Heart Attack History', value: patientDetails.hasStrokeOrHeartAttackHistory, icon: <HeartPulse className="mr-2 h-5 w-5 text-red-700" /> },
    { label: 'Bleeding Disorders', value: patientDetails.hasBleedingDisorders, icon: <Droplets className="mr-2 h-5 w-5 text-blue-500" /> },
    { label: 'Allergies', value: patientDetails.hasAllergy, specifics: patientDetails.allergySpecifics, icon: <Info className="mr-2 h-5 w-5 text-yellow-500" /> },
    { label: 'Asthma/Respiratory Issues', value: patientDetails.hasAsthma, icon: <Wind className="mr-2 h-5 w-5 text-green-500" /> },
  ].filter(condition => condition.value || (condition.label === 'Allergies' && condition.specifics)) : [];

  const renderContent = () => {
    if (isLoading || loadingAuth) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Loading your details...</p>
        </div>
      );
    }

    if (error || authError) {
      return (
        <Card className="w-full max-w-md mx-auto text-center">
            <CardHeader>
                <CardTitle className="text-destructive">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-muted-foreground">{error || authError?.message}</p>
                <p className="text-sm mt-2">
                    Please ensure you are logged in. If you believe this is an error, please contact the clinic.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/login">Go to Login</Link>
                </Button>
            </CardContent>
        </Card>
      );
    }

    if (patientDetails) {
      return (
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
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
          <CardContent className="p-6 space-y-6">
            {/* Personal Information */}
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
            
            {/* Medical Conditions */}
            <section>
                <h3 className="text-xl font-semibold mb-3 text-primary flex items-center"><Stethoscope className="mr-2 h-5 w-5" />Medical Overview</h3>
                {medicalConditions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {medicalConditions.map(condition => (
                        <div key={condition.label} className="flex items-center p-3 bg-background rounded-md border">
                            {condition.icon}
                            <div>
                                <span className="font-medium text-foreground">{condition.label}</span>
                                {condition.label === 'Allergies' && condition.specifics && (
                                    <p className="text-xs text-muted-foreground">Details: {condition.specifics}</p>
                                )}
                            </div>
                        </div>
                        ))}
                    </div>
                ) : <p className="text-muted-foreground text-sm p-4 border rounded-md bg-background">No specific medical conditions recorded.</p>}
            </section>
            
            {/* Medical Records/Notes */}
            {patientDetails.medicalRecords && (
                <>
                <Separator/>
                <section>
                    <h3 className="text-xl font-semibold mb-3 text-primary flex items-center"><FileText className="mr-2 h-5 w-5" />Clinic Notes</h3>
                    <div className="text-sm text-foreground whitespace-pre-wrap p-4 bg-background rounded-md border">{patientDetails.medicalRecords}</div>
                </section>
                </>
            )}

            {/* Attached Files */}
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
                                    {url.toLowerCase().endsWith('.pdf') ? (
                                        <FileText className="h-12 w-12 text-destructive" />
                                    ) : (
                                        <Image src={url} alt={`Attachment ${index + 1}`} width={150} height={150} className="object-contain w-full h-full" data-ai-hint="medical document scan" />
                                    )}
                                    </CardContent>
                                    <div className="p-2 text-xs text-center border-t">
                                        <p className="truncate">Attachment {index + 1}</p>
                                    </div>
                                </Card>
                            </a>
                        ))}
                    </div>
                </section>
                </>
            )}
          </CardContent>
        </Card>
      );
    }

    return null; // Should not be reached if logic is correct
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
}
