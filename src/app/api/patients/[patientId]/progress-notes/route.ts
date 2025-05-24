// src/app/api/patients/[patientId]/progress-notes/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db, generateId, authorize } from '@/lib/mockServerDb';
import type { ProgressNote, ProgressNoteImage } from '@/lib/types';

const progressNoteImageSchema = z.object({
  // For mock, we'll assume URL is provided directly or handled by a separate upload endpoint.
  // In real app, this might be a file upload.
  id: z.string().optional(),
  url: z.string().url("Image URL must be valid"),
  caption: z.string().optional(),
});

const progressNoteSchema = z.object({
  doctorId: z.string().min(1, "Doctor ID is required"),
  treatmentPlanId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM (24h) format or HH:MM AM/PM"), // Adjust regex if needed
  note: z.string().min(1, "Note content is required"),
  images: z.array(progressNoteImageSchema).optional(),
  progressStage: z.string().optional(),
});

interface ProgressNoteRouteParams {
  params: {
    patientId: string;
  }
}

export async function GET(request: NextRequest, { params }: ProgressNoteRouteParams) {
  // const authResult = await authorize(request, 'doctor');
  // if (!authResult.authorized || !authResult.user) { return authResult.error; }
  const { patientId } = params;

  if (!db.users.some(u => u.id === patientId && u.role === 'patient')) {
    return NextResponse.json({ message: "Patient not found" }, { status: 404 });
  }

  const notes = db.progressNotes.filter(pn => pn.patientId === patientId);
  return NextResponse.json(notes, { status: 200 });
}

export async function POST(request: NextRequest, { params }: ProgressNoteRouteParams) {
  // const authResult = await authorize(request, 'doctor');
  // if (!authResult.authorized || !authResult.user) { return authResult.error; }
  const { patientId } = params;
  
  if (!db.users.some(u => u.id === patientId && u.role === 'patient')) {
    return NextResponse.json({ message: "Patient not found" }, { status: 404 });
  }

  try {
    // For actual file uploads, you'd use `request.formData()`
    // For this mock, we assume JSON body with image URLs.
    const body = await request.json();
    const validation = progressNoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const data = validation.data;

    if (!db.users.some(u => u.id === data.doctorId && u.role === 'doctor')) {
         return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }
    if (data.treatmentPlanId && !db.treatmentPlans.some(tp => tp.id === data.treatmentPlanId)) {
        return NextResponse.json({ message: "Treatment plan not found" }, { status: 404 });
    }


    const newNote: ProgressNote = {
      id: generateId('pn_'),
      patientId,
      ...data,
      images: data.images?.map(img => ({ ...img, id: img.id || generateId('img_') })) || [],
    };

    db.progressNotes.push(newNote);
    return NextResponse.json(newNote, { status: 201 });

  } catch (error) {
    console.error('Error creating progress note:', error);
    // If error is due to JSON parsing for FormData, guide user.
    if (error instanceof SyntaxError && request.headers.get('content-type')?.includes('multipart/form-data')) {
        return NextResponse.json({ message: 'For file uploads, use FormData. This mock endpoint expects JSON with image URLs.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error creating progress note' }, { status: 500 });
  }
}
