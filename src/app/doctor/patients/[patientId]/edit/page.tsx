
// src/app/doctor/patients/[patientId]/edit/page.tsx
'use client';

import { useState, type FormEvent, ChangeEvent, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, ShieldAlert, HeartPulse, Droplets, Info, Wind, Save, Plus, X, Trash2 } from 'lucide-react';
import Image from 'next/image';
import type { Patient } from '@/lib/types';

interface FormData extends Omit<Patient, 'id' | 'age'> { 
  age: string; 
}

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.patientId as string;
  const { toast } = useToast();
  const xrayInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<FormData & { id: string; userId: string }>>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    age: '',
    medicalRecords: '',
    xrayImageUrls: [],
    hasDiabetes: false,
    hasHighBloodPressure: false,
    hasStrokeOrHeartAttackHistory: false,
    hasBleedingDisorders: false,
    hasAllergy: false,
    allergySpecifics: '',
    hasAsthma: false,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (patientId) {
      const fetchPatientData = async () => {
        setIsLoadingData(true);
        try {
          const response = await fetch(`/api/patients/${patientId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch patient data');
          }
          const data: Patient = await response.json();
          setFormData({
            ...data,
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '', 
            age: data.age?.toString() || '',
            xrayImageUrls: data.xrayImageUrls || [],
          });
        } catch (error: any) {
          toast({ variant: "destructive", title: "Error", description: error.message });
          router.push('/doctor/patients'); 
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchPatientData();
    }
  }, [patientId, toast, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
      if (name === 'hasAllergy' && !checked) {
        setFormData(prev => ({ ...prev, allergySpecifics: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

 const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]); // Append new files
       if (xrayInputRef.current) {
        xrayInputRef.current.value = ''; 
      }
    }
  };

  const removeSelectedFile = (indexToRemove: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };
  
  const removeUploadedImage = (urlToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      xrayImageUrls: (prev.xrayImageUrls || []).filter(url => url !== urlToRemove)
    }));
  };


  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.name?.trim()) newErrors.name = "Name is required.";
    if (!formData.email?.trim()) newErrors.email = "Email is required.";
    else if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid.";
    if (formData.age && isNaN(parseInt(formData.age))) newErrors.age = "Age must be a number.";
    else if (formData.age && parseInt(formData.age) < 0) newErrors.age = "Age cannot be negative.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please correct the errors in the form."});
      return;
    }
    
    setIsSubmitting(true);
    let finalXrayImageUrls = [...(formData.xrayImageUrls || [])];

    if (selectedFiles.length > 0) {
      setIsUploading(true);
      const uploadedUrls: string[] = [];
      let uploadOk = true;
      try {
        for (const file of selectedFiles) {
          const fileData = new FormData();
          fileData.append('imageFile', file);
          const response = await fetch('/api/upload/image', { method: 'POST', body: fileData });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message || `File upload failed for ${file.name}`);
          uploadedUrls.push(result.imageUrl);
        }
        finalXrayImageUrls = [...finalXrayImageUrls, ...uploadedUrls];
        setSelectedFiles([]);
        toast({ title: "Files Uploaded", description: `${uploadedUrls.length} new file(s) have been successfully uploaded and attached.` });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Upload Error", description: error.message });
        uploadOk = false;
      } finally {
        setIsUploading(false);
      }
      if (!uploadOk) {
        setIsSubmitting(false);
        return;
      }
    }

    const dataToSubmit = { ...formData };
    
    const patientDataToSubmit = {
        name: dataToSubmit.name,
        email: dataToSubmit.email,
        phone: dataToSubmit.phone?.trim() === '' ? null : dataToSubmit.phone,
        dateOfBirth: dataToSubmit.dateOfBirth?.trim() === '' ? null : dataToSubmit.dateOfBirth,
        age: dataToSubmit.age === '' || dataToSubmit.age === null ? null : parseInt(dataToSubmit.age, 10),
        medicalRecords: dataToSubmit.medicalRecords?.trim() === '' ? null : dataToSubmit.medicalRecords,
        xrayImageUrls: finalXrayImageUrls,
        hasDiabetes: dataToSubmit.hasDiabetes,
        hasHighBloodPressure: dataToSubmit.hasHighBloodPressure,
        hasStrokeOrHeartAttackHistory: dataToSubmit.hasStrokeOrHeartAttackHistory,
        hasBleedingDisorders: dataToSubmit.hasBleedingDisorders,
        hasAllergy: dataToSubmit.hasAllergy,
        allergySpecifics: dataToSubmit.hasAllergy ? (dataToSubmit.allergySpecifics?.trim() === '' ? null : dataToSubmit.allergySpecifics) : null,
        hasAsthma: dataToSubmit.hasAsthma,
    };
    
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientDataToSubmit),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.errors?.email?.[0] || "Failed to update patient");

      toast({ title: "Patient Updated!", description: `${data.name}'s details have been successfully updated.` });
      router.push(`/doctor/patients/${patientId}`); 
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error Updating Patient", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="space-y-6 mb-12">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Patient: {formData.name || 'Loading...'}</CardTitle>
          <CardDescription>Update the patient's details and medical information.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4"> {/* Changed to 3 cols for better DOB layout */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" value={formData.age || ''} onChange={handleChange} />
                {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
              </div>
            </div>

            {/* Medical Records */}
            <div className="space-y-2">
              <Label htmlFor="medicalRecords">Simple Medical Records / Notes</Label>
              <Textarea id="medicalRecords" name="medicalRecords" value={formData.medicalRecords || ''} onChange={handleChange} rows={4} placeholder="Enter relevant medical history, current medications, or general notes..." />
            </div>

            {/* Medical Conditions */}
            <div className="space-y-4">
              <Label className="font-semibold">Medical Conditions:</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                {[
                  { id: 'hasDiabetes', label: 'Diabetes', icon: <HeartPulse className="h-4 w-4 mr-2" /> },
                  { id: 'hasHighBloodPressure', label: 'High Blood Pressure', icon: <ShieldAlert className="h-4 w-4 mr-2" /> },
                  { id: 'hasStrokeOrHeartAttackHistory', label: 'History of Stroke/Heart Attack', icon: <HeartPulse className="h-4 w-4 mr-2" /> },
                  { id: 'hasBleedingDisorders', label: 'Bleeding Disorders', icon: <Droplets className="h-4 w-4 mr-2" /> },
                  { id: 'hasAllergy', label: 'Allergy', icon: <Info className="h-4 w-4 mr-2" /> },
                  { id: 'hasAsthma', label: 'Asthma/Respiratory Issues', icon: <Wind className="h-4 w-4 mr-2" /> },
                ].map(condition => (
                  <div key={condition.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={condition.id} 
                      name={condition.id}
                      checked={!!(formData as any)[condition.id]} 
                      onCheckedChange={(checked) => {
                        const isChecked = typeof checked === 'boolean' ? checked : false;
                        setFormData(prev => ({ ...prev, [condition.id]: isChecked }));
                        if (condition.id === 'hasAllergy' && !isChecked) {
                            setFormData(prev => ({ ...prev, allergySpecifics: '' }));
                        }
                      }}
                    />
                    <Label htmlFor={condition.id} className="flex items-center cursor-pointer text-sm">
                        {condition.icon} {condition.label}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.hasAllergy && (
                <div className="space-y-1 pl-6">
                  <Label htmlFor="allergySpecifics">Allergy Specifics</Label>
                  <Input id="allergySpecifics" name="allergySpecifics" value={formData.allergySpecifics || ''} onChange={handleChange} placeholder="e.g., Penicillin, Latex" />
                </div>
              )}
            </div>

            {/* X-ray Images */}
            <div className="space-y-2">
              <Label htmlFor="xrayImagesInputEdit">X-ray Images or PDFs (Optional)</Label>
               <Input 
                id="xrayImagesInputEdit"
                type="file" 
                multiple 
                onChange={handleFileChange} 
                className="hidden"
                ref={xrayInputRef}
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" 
              />
              <Button type="button" variant="outline" onClick={() => xrayInputRef.current?.click()}>
                <Plus className="h-4 w-4" /> Add Files
              </Button>

              {selectedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">Selected files to upload ({selectedFiles.length}):</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedFiles.map((file, index) => (
                       <div key={index} className="relative group w-20 h-20 rounded border p-1 flex items-center justify-center">
                        {file.type.startsWith('image/') ? (
                            <Image src={URL.createObjectURL(file)} alt={file.name} layout="fill" objectFit="contain" className="rounded" data-ai-hint="medical scan document"/>
                        ) : (
                            <FileText className="h-10 w-10 text-muted-foreground" />
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onClick={() => removeSelectedFile(index)}
                          aria-label="Remove selected file"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(formData.xrayImageUrls?.length || 0) > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">Current attachments:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.xrayImageUrls?.map((url, index) => (
                      <div key={index} className="relative h-20 w-20 rounded border group p-1 flex items-center justify-center">
                        {url.toLowerCase().endsWith('.pdf') ? (
                            <FileText className="h-10 w-10 text-destructive" />
                        ) : (
                            <Image src={url} alt={`Uploaded file ${index + 1}`} layout="fill" objectFit="contain" className="rounded" data-ai-hint="medical scan document"/>
                        )}
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-0 right-0 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            onClick={() => removeUploadedImage(url)}
                            aria-label="Remove file"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => router.push(`/doctor/patients/${patientId}`)}
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </Button>
            <Button className="w-full sm:w-auto" type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting || isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
    

    

    
