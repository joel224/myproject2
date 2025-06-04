
// src/app/staff/patients/new/page.tsx
'use client';

import { useState, type FormEvent, ChangeEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, ShieldAlert, HeartPulse, Droplets, Info, Wind, Plus, X, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface FormDataState {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  age: string; 
  medicalRecords: string;
  xrayImageUrls: string[];
  hasDiabetes: boolean;
  hasHighBloodPressure: boolean;
  hasStrokeOrHeartAttackHistory: boolean;
  hasBleedingDisorders: boolean;
  hasAllergy: boolean;
  allergySpecifics: string;
  hasAsthma: boolean;
  password?: string; 
}

export default function AddNewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const xrayInputRef = useRef<HTMLInputElement>(null);

  const initialFormData: FormDataState = {
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
    password: '',
  };

  const [formData, setFormData] = useState<FormDataState>(initialFormData);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormDataState, string>>>({});
  const [showUploadOrClearMessage, setShowUploadOrClearMessage] = useState(false);


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
    if (errors[name as keyof FormDataState]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
      setShowUploadOrClearMessage(true);
       if (xrayInputRef.current) {
        xrayInputRef.current.value = ''; 
      }
    }
  };

  const removeSelectedFile = (indexToRemove: number) => {
    setSelectedFiles(prevFiles => {
      const updatedFiles = prevFiles.filter((_, index) => index !== indexToRemove);
      if (updatedFiles.length === 0) {
        setShowUploadOrClearMessage(false);
      }
      return updatedFiles;
    });
  };
  
  const removeUploadedImage = (urlToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      xrayImageUrls: (prev.xrayImageUrls || []).filter(url => url !== urlToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormDataState, string>> = {};
    if (!formData.name.trim()) {
        newErrors.name = "Name is required.";
    } else if (formData.name.trim().length < 2) {
        newErrors.name = "Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
        newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid.";
    }

    if (formData.age && isNaN(parseInt(formData.age))) {
        newErrors.age = "Age must be a number.";
    } else if (formData.age && parseInt(formData.age) < 0) {
        newErrors.age = "Age cannot be negative.";
    }
    
    if (formData.password && formData.password.length > 0 && formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters long.";
    }

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
    let currentXrayImageUrls = [...formData.xrayImageUrls];

    if (selectedFiles.length > 0) {
      setIsUploading(true);
      const uploadedUrlsThisรอบ: string[] = [];
      let uploadOk = true;
      try {
        for (const file of selectedFiles) {
          const fileData = new FormData();
          fileData.append('imageFile', file);
          const response = await fetch('/api/upload/image', { method: 'POST', body: fileData });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message || `File upload failed for ${file.name}`);
          uploadedUrlsThisรอบ.push(result.imageUrl);
        }
        currentXrayImageUrls = [...currentXrayImageUrls, ...uploadedUrlsThisรอบ];
        setSelectedFiles([]); 
        setShowUploadOrClearMessage(false);
        toast({ title: "Files Uploaded", description: `${uploadedUrlsThisรอบ.length} file(s) have been successfully uploaded and attached.` });
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
    
    const patientDataToSubmit = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() === '' ? undefined : formData.phone.trim(),
      dateOfBirth: formData.dateOfBirth.trim() === '' ? undefined : formData.dateOfBirth.trim(),
      age: formData.age ? parseInt(formData.age, 10) : undefined,
      medicalRecords: formData.medicalRecords.trim() === '' ? undefined : formData.medicalRecords.trim(),
      xrayImageUrls: currentXrayImageUrls,
      hasDiabetes: formData.hasDiabetes,
      hasHighBloodPressure: formData.hasHighBloodPressure,
      hasStrokeOrHeartAttackHistory: formData.hasStrokeOrHeartAttackHistory,
      hasBleedingDisorders: formData.hasBleedingDisorders,
      hasAllergy: formData.hasAllergy,
      allergySpecifics: formData.hasAllergy ? (formData.allergySpecifics.trim() === '' ? undefined : formData.allergySpecifics.trim()) : undefined,
      hasAsthma: formData.hasAsthma,
      password: formData.password && formData.password.trim() !== '' ? formData.password.trim() : undefined,
    };

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientDataToSubmit),
      });
      const data = await response.json();
      if (!response.ok) {
        let errorMessage = data.message || "Failed to add patient";
        if (data.errors && typeof data.errors === 'object') {
            const fieldErrors = Object.values(data.errors as Record<string, string[]>).flat().join('; ');
            if (fieldErrors) errorMessage = `${data.message}: ${fieldErrors}`;
        }
        throw new Error(errorMessage);
      }

      toast({ title: "Patient Added!", description: `${data.name} has been successfully added.` });
      setFormData(initialFormData);
      setSelectedFiles([]);
      setShowUploadOrClearMessage(false);
      setErrors({});
      // router.push('/staff/patients'); // Optional redirect
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error Adding Patient", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 mb-12">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Patient</CardTitle>
          <CardDescription>Fill in the patient's details and medical information.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Patient's full name" />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="patient@example.com" />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
            </div>
             <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Optional" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} placeholder="Optional" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} placeholder="Optional" />
                 {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
              </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Set Password (Optional)</Label>
                    <Input 
                        id="password" 
                        name="password" 
                        type="password" 
                        value={formData.password || ''} 
                        onChange={handleChange} 
                        placeholder="Min. 6 characters if set" 
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    <p className="text-xs text-muted-foreground">If provided, the patient can use this to log into their portal.</p>
                </div>
            </div>


            <div className="space-y-2">
              <Label htmlFor="medicalRecords">Simple Medical Records / Notes</Label>
              <Textarea id="medicalRecords" name="medicalRecords" value={formData.medicalRecords} onChange={handleChange} placeholder="Brief medical history, current medications, etc." rows={3} />
            </div>

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
                      checked={formData[condition.id as keyof FormDataState] as boolean} 
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
                  <Input id="allergySpecifics" name="allergySpecifics" value={formData.allergySpecifics} onChange={handleChange} placeholder="e.g., Penicillin, Latex" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="xrayImagesInput">X-ray Images or PDFs (Optional)</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => xrayInputRef.current?.click()}>
                  <Plus className="h-4 w-4" /> Add Files
                </Button>
                <Input 
                  id="xrayImagesInput"
                  type="file" 
                  multiple 
                  onChange={handleFileChange} 
                  className="hidden"
                  ref={xrayInputRef}
                  accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" 
                />
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">Selected files to upload ({selectedFiles.length}):</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group w-20 h-20 rounded border p-1 flex items-center justify-center">
                        {file.type.startsWith('image/') ? (
                            <Image src={URL.createObjectURL(file)} alt={file.name} layout="fill" objectFit="contain" className="rounded" data-ai-hint="medical scan document" />
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

              {formData.xrayImageUrls.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">Current attachments:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.xrayImageUrls.map((url, index) => (
                      <div key={index} className="relative h-20 w-20 rounded border group p-1 flex items-center justify-center">
                        {url.toLowerCase().endsWith('.pdf') ? (
                            <FileText className="h-10 w-10 text-destructive" />
                        ) : (
                            <Image src={url} alt={`Uploaded file ${index + 1}`} layout="fill" objectFit="contain" className="rounded" data-ai-hint="medical scan document" />
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
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting || isUploading}>
              Cancel
            </Button>
            <Button className="w-full sm:w-auto" type="submit" disabled={isSubmitting || isUploading || showUploadOrClearMessage}>
              {isSubmitting || isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Add Patient
            </Button>
          </CardFooter>
            {showUploadOrClearMessage && (
                <p className="text-xs text-destructive text-center mt-2 px-6">
                    You have files selected. They will be uploaded when you click "Add Patient". <br/> Or, remove them from the selection above if you don't want to include them.
                </p>
            )}
        </form>
      </Card>
    </div>
  );
}
    

    