
// src/app/api/patients/[patientId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/mockServerDb'; 
import type { Patient } from '@/lib/types';
import type { UserAuth } from '@/lib/mockServerDb';


const updatePatientSchema = z.object({
  name: z.string().min(2, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of Birth must be YYYY-MM-DD").optional().nullable(),
  age: z.number().int().min(0).optional().nullable(),
  medicalRecords: z.string().optional().nullable(),
  xrayImageUrls: z.array(z.string().url()).optional(),
  hasDiabetes: z.boolean().optional(),
  hasHighBloodPressure: z.boolean().optional(),
  hasStrokeOrHeartAttackHistory: z.boolean().optional(),
  hasBleedingDisorders: z.boolean().optional(),
  hasAllergy: z.boolean().optional(),
  allergySpecifics: z.string().optional().nullable(),
  hasAsthma: z.boolean().optional(),
});

interface PatientRouteParams {
  params: {
    patientId: string;
  }
}

export async function GET(request: NextRequest, { params }: PatientRouteParams) {
  const { patientId } = params;
  try {
    const patientUser = db.users.find(u => u.id === patientId && u.role === 'patient');

    if (!patientUser) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }
    
    // Exclude passwordHash before sending
    const { passwordHash, ...patientResponse } = patientUser;

    return NextResponse.json(patientResponse, { status: 200 });

  } catch (error) {
    console.error(`Error fetching patient ${patientId}:`, error);
    return NextResponse.json({ message: 'Error fetching patient details' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: PatientRouteParams) {
  const { patientId } = params;

  try {
    const body = await request.json();
    const validation = updatePatientSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData = validation.data;
    
    const patientIndex = db.users.findIndex(u => u.id === patientId && u.role === 'patient');

    if (patientIndex === -1) {
        return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    if (updateData.email && updateData.email !== db.users[patientIndex].email) {
        const emailCollisionCheck = db.users.some(u => u.email === updateData.email && u.id !== patientId);
        if (emailCollisionCheck) {
          return NextResponse.json({ message: "Email already in use by another user." }, { status: 409 });
        }
    }
    
    const currentPatient = db.users[patientIndex];
    const updatedPatient: UserAuth = {
      ...currentPatient,
      ...updateData,
      age: updateData.age ?? currentPatient.age,
      updatedAt: new Date().toISOString(),
    };
    
    db.users[patientIndex] = updatedPatient;

    const { passwordHash, ...patientResponse } = updatedPatient;
    return NextResponse.json(patientResponse, { status: 200 });

  } catch (error) {
    console.error(`Error updating patient ${patientId}:`, error);
    return NextResponse.json({ message: 'Error updating patient' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: PatientRouteParams) {
  const { patientId } = params;

  try {
    const patientIndex = db.users.findIndex(u => u.id === patientId && u.role === 'patient');
    
    if (patientIndex === -1) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    db.users.splice(patientIndex, 1);
    
    // In a real app, you'd cascade deletes or handle related data (appointments, etc.)
    // For mock DB, this is simpler. We can filter related data on the fly if needed.

    return NextResponse.json({ message: "Patient deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error(`Error deleting patient ${patientId}:`, error);
    return NextResponse.json({ message: 'Error deleting patient' }, { status: 500 });
  }
}
