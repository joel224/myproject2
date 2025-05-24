// src/app/api/progress-notes/[noteId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db, generateId, authorize } from '@/lib/mockServerDb';
import type { ProgressNoteImage } from '@/lib/types';

const progressNoteImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url("Image URL must be valid"),
  caption: z.string().optional(),
});

const updateProgressNoteSchema = z.object({
  doctorId: z.string().min(1).optional(),
  treatmentPlanId: z.string().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM (24h) format or HH:MM AM/PM").optional(),
  note: z.string().min(1).optional(),
  images: z.array(progressNoteImageSchema).optional(),
  progressStage: z.string().optional().nullable(),
});

interface SpecificProgressNoteParams {
  params: {
    noteId: string;
  }
}

export async function GET(request: NextRequest, { params }: SpecificProgressNoteParams) {
  // const authResult = await authorize(request, 'doctor');
  // if (!authResult.authorized || !authResult.user) { return authResult.error; }
  const { noteId } = params;
  const note = db.progressNotes.find(pn => pn.id === noteId);

  if (!note) {
    return NextResponse.json({ message: "Progress note not found" }, { status: 404 });
  }
  return NextResponse.json(note, { status: 200 });
}

export async function PUT(request: NextRequest, { params }: SpecificProgressNoteParams) {
  // const authResult = await authorize(request, 'doctor');
  // if (!authResult.authorized || !authResult.user) { return authResult.error; }
  const { noteId } = params;
  const noteIndex = db.progressNotes.findIndex(pn => pn.id === noteId);

  if (noteIndex === -1) {
    return NextResponse.json({ message: "Progress note not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const validation = updateProgressNoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData = validation.data;
    const currentNote = db.progressNotes[noteIndex];
    const updatedNote = { ...currentNote, ...updateData };

    if (updateData.images) {
      updatedNote.images = updateData.images.map(img => ({ ...img, id: img.id || generateId('img_') }));
    }


    db.progressNotes[noteIndex] = updatedNote;
    return NextResponse.json(updatedNote, { status: 200 });

  } catch (error) {
    console.error(`Error updating progress note ${noteId}:`, error);
    return NextResponse.json({ message: 'Error updating progress note' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: SpecificProgressNoteParams) {
  // const authResult = await authorize(request, 'doctor');
  // if (!authResult.authorized || !authResult.user) { return authResult.error; }
  const { noteId } = params;
  const noteIndex = db.progressNotes.findIndex(pn => pn.id === noteId);

  if (noteIndex === -1) {
    return NextResponse.json({ message: "Progress note not found" }, { status: 404 });
  }

  db.progressNotes.splice(noteIndex, 1);
  return NextResponse.json({ message: "Progress note deleted successfully" }, { status: 200 });
}
