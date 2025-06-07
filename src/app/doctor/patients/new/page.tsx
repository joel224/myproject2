
// src/app/doctor/patients/new/page.tsx
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
import { Loader2, FileText, ShieldAlert, HeartPulse, Droplets, Info, Wind, Plus, Trash2, Save, User, Mail, Phone as PhoneIcon, CalendarDays, Stethoscope, Paperclip, NotebookPen } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

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
}

export default function DoctorAddNewPatientPage() {
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
    let uploadedImageUrlsForSubmission: string[] = [...formData.xrayImageUrls];

    if (selectedFiles.length > 0) {
      setIsUploading(true);
      const newlyUploadedUrls: string[] = [];
      let uploadOk = true;
      try {
        for (const file of selectedFiles) {
          const fileData = new FormData();
          fileData.append('imageFile', file);
          const response = await fetch('/api/upload/image', { method: 'POST', body: fileData });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message || `File upload failed for ${file.name}`);
          newlyUploadedUrls.push(result.imageUrl);
        }
        uploadedImageUrlsForSubmission = [...uploadedImageUrlsForSubmission, ...newlyUploadedUrls];
        setSelectedFiles([]);
        setShowUploadOrClearMessage(false);
        toast({ title: "Files Uploaded", description: `${newlyUploadedUrls.length} file(s) have been successfully uploaded and will be attached.` });
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
      xrayImageUrls: uploadedImageUrlsForSubmission,
      hasDiabetes: formData.hasDiabetes,
      hasHighBloodPressure: formData.hasHighBloodPressure,
      hasStrokeOrHeartAttackHistory: formData.hasStrokeOrHeartAttackHistory,
      hasBleedingDisorders: formData.hasBleedingDisorders,
      hasAllergy: formData.hasAllergy,
      allergySpecifics: formData.hasAllergy ? (formData.allergySpecifics.trim() === '' ? undefined : formData.allergySpecifics.trim()) : undefined,
      hasAsthma: formData.hasAsthma,
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

      toast({ title: "Patient Added!", description: `${data.name} has been successfully added to the central clinic records.` });
      setFormData(initialFormData);
      setSelectedFiles([]);
      setShowUploadOrClearMessage(false);
      setErrors({});
      router.push(`/doctor/patients/${data.id}`);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error Adding Patient", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 mb-16">
      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Add New Patient Record</CardTitle>
          <CardDescription>
            Enter the patient's details. This information will be added to the central clinic records.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-10 pt-6">

            {/* Section: Patient Identification */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold text-primary">Patient Identification</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., John Doe" />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john.doe@example.com" />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
              </div>
            </section>

            <Separator />

            {/* Section: Contact & Demographics */}
            <section className="space-y-6">
               <div className="flex items-center gap-3">
                <PhoneIcon className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold text-primary">Contact & Demographics</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="(123) 456-7890"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
                  <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="age">Age (Optional)</Label>
                  <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} placeholder="e.g., 35"/>
                  {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
                </div>
              </div>
            </section>

            <Separator />

            {/* Section: Medical Overview */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <NotebookPen className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold text-primary">Medical Overview</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicalRecords">General Medical Notes (Optional)</Label>
                <Textarea id="medicalRecords" name="medicalRecords" value={formData.medicalRecords} onChange={handleChange} placeholder="Enter any relevant medical history, current medications, or general notes..." rows={4} />
              </div>
            </section>
            
            <Separator />

            {/* Section: Specific Medical Conditions */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <Stethoscope className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-semibold text-primary">Specific Medical Conditions</h3>
                </div>
              <div className="space-y-4">
                <Label className="font-medium text-muted-foreground">Please check all that apply:</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { id: 'hasDiabetes', label: 'Diabetes', icon: <HeartPulse className="h-4 w-4 mr-2" /> },
                    { id: 'hasHighBloodPressure', label: 'High Blood Pressure', icon: <ShieldAlert className="h-4 w-4 mr-2" /> },
                    { id: 'hasStrokeOrHeartAttackHistory', label: 'History of Stroke/Heart Attack', icon: <HeartPulse className="h-4 w-4 mr-2" /> },
                    { id: 'hasBleedingDisorders', label: 'Bleeding Disorders', icon: <Droplets className="h-4 w-4 mr-2" /> },
                    { id: 'hasAllergy', label: 'Allergy', icon: <Info className="h-4 w-4 mr-2" /> },
                    { id: 'hasAsthma', label: 'Asthma/Respiratory Issues', icon: <Wind className="h-4 w-4 mr-2" /> },
                  ].map(condition => (
                    <div key={condition.id} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/50 transition-colors">
                      <Checkbox
                        id={`doc-${condition.id}`}
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
                      <Label htmlFor={`doc-${condition.id}`} className="flex items-center cursor-pointer text-sm font-normal">
                          {condition.icon} {condition.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.hasAllergy && (
                  <div className="space-y-2 pl-4 mt-3 border-l-2 border-primary ml-2">
                    <Label htmlFor="allergySpecifics">Allergy Specifics (if any)</Label>
                    <Input id="allergySpecifics" name="allergySpecifics" value={formData.allergySpecifics} onChange={handleChange} placeholder="e.g., Penicillin, Latex, Pollen" />
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* Section: File Uploads */}
            <section className="space-y-6">
               <div className="flex items-center gap-3">
                <Paperclip className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold text-primary">Supporting Documents</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="xrayImagesInputDoctor">Upload X-ray Images or PDFs (Optional)</Label>
                <div className="flex items-center gap-3 p-4 border-2 border-dashed rounded-md hover:border-primary transition-colors">
                  <Button type="button" variant="outline" onClick={() => xrayInputRef.current?.click()} className="bg-transparent hover:bg-accent">
                    <Plus className="h-5 w-5 mr-2" /> Select Files
                  </Button>
                  <Input
                    id="xrayImagesInputDoctor"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    ref={xrayInputRef}
                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                  />
                  <span className="text-sm text-muted-foreground">Drag & drop or click to select files.</span>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Selected files ({selectedFiles.length}):</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group border rounded-md p-2 flex flex-col items-center text-center">
                          {file.type.startsWith('image/') ? (
                              <Image src={URL.createObjectURL(file)} alt={file.name} width={80} height={80} className="rounded object-contain h-20 w-20 mb-1" data-ai-hint="medical scan document"/>
                          ) : (
                              <FileText className="h-12 w-12 text-muted-foreground mb-1" />
                          )}
                          <p className="text-xs text-foreground truncate w-full">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 text-destructive opacity-50 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeSelectedFile(index)}
                            aria-label="Remove selected file"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.xrayImageUrls.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Current attachments:</p>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {formData.xrayImageUrls.map((url, index) => (
                        <div key={index} className="relative group border rounded-md p-2 flex flex-col items-center text-center">
                          {url.toLowerCase().endsWith('.pdf') ? (
                              <FileText className="h-12 w-12 text-destructive mb-1" />
                          ) : (
                              <Image src={url} alt={`Uploaded file ${index + 1}`} width={80} height={80} className="rounded object-contain h-20 w-20 mb-1" data-ai-hint="medical scan document"/>
                          )}
                          <p className="text-xs text-foreground truncate w-full">Attachment {index+1}</p>
                          <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 text-destructive opacity-50 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeUploadedImage(url)}
                              aria-label="Remove file"
                          >
                              <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-8 border-t mt-6">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting || isUploading} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button className="w-full sm:w-auto" type="submit" disabled={isSubmitting || isUploading || showUploadOrClearMessage}>
              {isSubmitting || isUploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Add Patient Record
            </Button>
          </CardFooter>
            {showUploadOrClearMessage && (
                <p className="text-xs text-destructive text-center mt-2 px-6 pb-4">
                    You have files selected. They will be uploaded when you click "Add Patient". <br/> Or, remove them from the selection above if you don't want to include them.
                </p>
            )}
        </form>
      </Card>
    </div>
  );
}
