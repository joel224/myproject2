
// src/app/api/patients/[patientId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/mockServerDb'; // Use mock DB
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
    const user = db.users.find(u => u.id === patientId);

    if (!user || user.role !== 'patient') {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    const patientResponse: Patient = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      age: user.age,
      medicalRecords: user.medicalRecords,
      xrayImageUrls: user.xrayImageUrls || [],
      hasDiabetes: user.hasDiabetes,
      hasHighBloodPressure: user.hasHighBloodPressure,
      hasStrokeOrHeartAttackHistory: user.hasStrokeOrHeartAttackHistory,
      hasBleedingDisorders: user.hasBleedingDisorders,
      hasAllergy: user.hasAllergy,
      allergySpecifics: user.allergySpecifics,
      hasAsthma: user.hasAsthma,
    };
    return NextResponse.json(patientResponse, { status: 200 });

  } catch (error) {
    console.error(`Error fetching patient ${patientId} from mock DB:`, error);
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

    const currentPatient = db.users[patientIndex];
    
    // Check for email collision if email is being updated
    if (updateData.email && updateData.email !== currentPatient.email) {
        if (db.users.some(u => u.email === updateData.email && u.id !== patientId)) {
            return NextResponse.json({ message: "Email already in use by another user." }, { status: 409 });
        }
    }

    const updatedPatient: UserAuth = {
      ...currentPatient,
      ...updateData, // Spread validated data
      // Ensure nullable fields are handled correctly (set to undefined if null)
      phone: updateData.phone === null ? undefined : updateData.phone || currentPatient.phone,
      dateOfBirth: updateData.dateOfBirth === null ? undefined : updateData.dateOfBirth || currentPatient.dateOfBirth,
      age: updateData.age === null ? undefined : updateData.age || currentPatient.age,
      medicalRecords: updateData.medicalRecords === null ? undefined : updateData.medicalRecords || currentPatient.medicalRecords,
      allergySpecifics: updateData.hasAllergy === false ? undefined : (updateData.allergySpecifics === null ? undefined : updateData.allergySpecifics || currentPatient.allergySpecifics),
      updatedAt: new Date().toISOString(),
    };
    
    // Ensure allergySpecifics is cleared if hasAllergy is set to false
    if (updateData.hasAllergy === false) {
        updatedPatient.allergySpecifics = undefined;
    }


    db.users[patientIndex] = updatedPatient;
    
    const patientResponse: Patient = {
      id: updatedPatient.id,
      name: updatedPatient.name,
      email: updatedPatient.email,
      phone: updatedPatient.phone,
      dateOfBirth: updatedPatient.dateOfBirth,
      age: updatedPatient.age,
      medicalRecords: updatedPatient.medicalRecords,
      xrayImageUrls: updatedPatient.xrayImageUrls || [],
      hasDiabetes: updatedPatient.hasDiabetes,
      hasHighBloodPressure: updatedPatient.hasHighBloodPressure,
      hasStrokeOrHeartAttackHistory: updatedPatient.hasStrokeOrHeartAttackHistory,
      hasBleedingDisorders: updatedPatient.hasBleedingDisorders,
      hasAllergy: updatedPatient.hasAllergy,
      allergySpecifics: updatedPatient.allergySpecifics,
      hasAsthma: updatedPatient.hasAsthma,
    };

    return NextResponse.json(patientResponse, { status: 200 });

  } catch (error) {
    console.error(`Error updating patient ${patientId} in mock DB:`, error);
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
    
    // Consider what to do with related mock data (appointments, invoices, etc.)
    // For now, just deleting the patient user record.
    // db.appointments = db.appointments.filter(apt => apt.patientId !== patientId);
    // db.invoices = db.invoices.filter(inv => inv.patientId !== patientId);
    // etc.

    return NextResponse.json({ message: "Patient deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error(`Error deleting patient ${patientId} from mock DB:`, error);
    return NextResponse.json({ message: 'Error deleting patient' }, { status: 500 });
  }
}
