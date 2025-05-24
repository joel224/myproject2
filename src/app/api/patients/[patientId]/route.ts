// src/app/api/patients/[patientId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db, authorize, UserAuth } from '@/lib/mockServerDb';
import type { Patient } from '@/lib/types';

const updatePatientSchema = z.object({
  name: z.string().min(2, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(), // Should be ISO date string e.g. "YYYY-MM-DD"
});

interface PatientRouteParams {
  params: {
    patientId: string;
  }
}

/**
 * GET /api/patients/{patientId} - Get specific patient details
 */
export async function GET(request: NextRequest, { params }: PatientRouteParams) {
  // const authResult = await authorize(request, 'staff'); // or 'doctor'
  // if (!authResult.authorized || !authResult.user) {
  //   return authResult.error;
  // }
  const { patientId } = params;
  const patientUser = db.users.find(u => u.id === patientId && u.role === 'patient');

  if (!patientUser) {
    return NextResponse.json({ message: "Patient not found" }, { status: 404 });
  }
  
  const patientData = {
    id: patientUser.id,
    name: patientUser.name,
    email: patientUser.email,
    phone: patientUser.phone,
    dateOfBirth: patientUser.dateOfBirth,
  };

  return NextResponse.json(patientData, { status: 200 });
}

/**
 * PUT /api/patients/{patientId} - Update patient details
 */
export async function PUT(request: NextRequest, { params }: PatientRouteParams) {
  // const authResult = await authorize(request, 'staff'); // or 'doctor'
  // if (!authResult.authorized || !authResult.user) {
  //   return authResult.error;
  // }

  const { patientId } = params;
  let patientUser = db.users.find(u => u.id === patientId && u.role === 'patient');

  if (!patientUser) {
    return NextResponse.json({ message: "Patient not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const validation = updatePatientSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData = validation.data;

    // Update user details
    if (updateData.name) patientUser.name = updateData.name;
    if (updateData.email) {
        // Check if new email already exists for another user
        if(db.users.some(u => u.email === updateData.email && u.id !== patientId)) {
            return NextResponse.json({ message: "Email already in use by another account." }, { status: 409 });
        }
        patientUser.email = updateData.email;
    }
    if (updateData.phone !== undefined) patientUser.phone = updateData.phone ?? undefined; // handle null to undefined
    if (updateData.dateOfBirth !== undefined) patientUser.dateOfBirth = updateData.dateOfBirth ?? undefined; // handle null to undefined

    // Also update the separate db.patients array if it's being used
    let patientRecord = db.patients.find(p => p.id === patientId);
    if (patientRecord) {
        if (updateData.name) patientRecord.name = updateData.name;
        if (updateData.email) patientRecord.email = updateData.email;
        if (updateData.phone !== undefined) patientRecord.phone = updateData.phone ?? undefined;
        if (updateData.dateOfBirth !== undefined) patientRecord.dateOfBirth = updateData.dateOfBirth ?? undefined;
    }


    const patientToReturn = {
        id: patientUser.id,
        name: patientUser.name,
        email: patientUser.email,
        phone: patientUser.phone,
        dateOfBirth: patientUser.dateOfBirth,
    };
    return NextResponse.json(patientToReturn, { status: 200 });

  } catch (error) {
    console.error(`Error updating patient ${patientId}:`, error);
    return NextResponse.json({ message: 'Error updating patient' }, { status: 500 });
  }
}

/**
 * DELETE /api/patients/{patientId} - Delete a patient
 */
export async function DELETE(request: NextRequest, { params }: PatientRouteParams) {
  // const authResult = await authorize(request, 'staff'); // or 'admin'
  // if (!authResult.authorized || !authResult.user) {
  //   return authResult.error;
  // }

  const { patientId } = params;
  const patientIndex = db.users.findIndex(u => u.id === patientId && u.role === 'patient');

  if (patientIndex === -1) {
    return NextResponse.json({ message: "Patient not found" }, { status: 404 });
  }

  db.users.splice(patientIndex, 1);

  // Also remove from the separate db.patients array
  const patientRecordIndex = db.patients.findIndex(p => p.id === patientId);
  if (patientRecordIndex !== -1) {
      db.patients.splice(patientRecordIndex, 1);
  }
  
  // Consider what to do with related data (appointments, treatment plans, etc.) - cascading deletes or archiving.
  // For this mock, we'll just remove the patient.

  return NextResponse.json({ message: "Patient deleted successfully" }, { status: 200 });
}
