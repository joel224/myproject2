
// src/app/api/patients/[patientId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db, authorize, UserAuth } from '@/lib/mockServerDb'; // Ensure UserAuth is correctly typed/exported if used directly
import type { Patient } from '@/lib/types';

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
  // Password should generally be updated via a separate, more secure flow (e.g., "change password")
  // password: z.string().min(6, "Password must be at least 6 characters").optional(),
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
  
  // Construct the patient object to return, including all fields
  const patientData: Patient = {
    id: patientUser.id,
    name: patientUser.name,
    email: patientUser.email,
    phone: patientUser.phone,
    dateOfBirth: patientUser.dateOfBirth,
    age: patientUser.age,
    medicalRecords: patientUser.medicalRecords,
    xrayImageUrls: patientUser.xrayImageUrls || [],
    hasDiabetes: patientUser.hasDiabetes,
    hasHighBloodPressure: patientUser.hasHighBloodPressure,
    hasStrokeOrHeartAttackHistory: patientUser.hasStrokeOrHeartAttackHistory,
    hasBleedingDisorders: patientUser.hasBleedingDisorders,
    hasAllergy: patientUser.hasAllergy,
    allergySpecifics: patientUser.allergySpecifics,
    hasAsthma: patientUser.hasAsthma,
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
  const userIndex = db.users.findIndex(u => u.id === patientId && u.role === 'patient');

  if (userIndex === -1) {
    return NextResponse.json({ message: "Patient not found" }, { status: 404 });
  }
  const patientUser = db.users[userIndex];

  try {
    const body = await request.json();
    const validation = updatePatientSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData = validation.data;

    // Update user details in db.users
    if (updateData.name) patientUser.name = updateData.name;
    if (updateData.email) {
        if(db.users.some(u => u.email === updateData.email && u.id !== patientId)) {
            return NextResponse.json({ message: "Email already in use by another account." }, { status: 409 });
        }
        patientUser.email = updateData.email;
    }
    if (updateData.phone !== undefined) patientUser.phone = updateData.phone ?? undefined;
    if (updateData.dateOfBirth !== undefined) patientUser.dateOfBirth = updateData.dateOfBirth ?? undefined;
    if (updateData.age !== undefined) patientUser.age = updateData.age ?? undefined;
    if (updateData.medicalRecords !== undefined) patientUser.medicalRecords = updateData.medicalRecords ?? undefined;
    if (updateData.xrayImageUrls !== undefined) patientUser.xrayImageUrls = updateData.xrayImageUrls;
    if (updateData.hasDiabetes !== undefined) patientUser.hasDiabetes = updateData.hasDiabetes;
    if (updateData.hasHighBloodPressure !== undefined) patientUser.hasHighBloodPressure = updateData.hasHighBloodPressure;
    if (updateData.hasStrokeOrHeartAttackHistory !== undefined) patientUser.hasStrokeOrHeartAttackHistory = updateData.hasStrokeOrHeartAttackHistory;
    if (updateData.hasBleedingDisorders !== undefined) patientUser.hasBleedingDisorders = updateData.hasBleedingDisorders;
    if (updateData.hasAllergy !== undefined) patientUser.hasAllergy = updateData.hasAllergy;
    if (updateData.hasAllergy === false) { // if allergy is explicitly set to false, clear specifics
        patientUser.allergySpecifics = undefined;
    } else if (updateData.allergySpecifics !== undefined) {
        patientUser.allergySpecifics = updateData.allergySpecifics ?? undefined;
    }
    if (updateData.hasAsthma !== undefined) patientUser.hasAsthma = updateData.hasAsthma;

    db.users[userIndex] = patientUser;


    // Also update the separate db.patients array if it's being used consistently
    let patientRecord = db.patients.find(p => p.id === patientId);
    if (patientRecord) {
        Object.assign(patientRecord, {
            name: patientUser.name,
            email: patientUser.email,
            phone: patientUser.phone,
            dateOfBirth: patientUser.dateOfBirth,
            age: patientUser.age,
            medicalRecords: patientUser.medicalRecords,
            xrayImageUrls: patientUser.xrayImageUrls,
            hasDiabetes: patientUser.hasDiabetes,
            hasHighBloodPressure: patientUser.hasHighBloodPressure,
            hasStrokeOrHeartAttackHistory: patientUser.hasStrokeOrHeartAttackHistory,
            hasBleedingDisorders: patientUser.hasBleedingDisorders,
            hasAllergy: patientUser.hasAllergy,
            allergySpecifics: patientUser.allergySpecifics,
            hasAsthma: patientUser.hasAsthma,
        });
    } else {
        // If not found in db.patients, consider adding it or ensure data consistency strategy
        console.warn(`Patient record for ${patientId} not found in db.patients array during update.`);
    }
    
    const patientToReturn: Patient = {
        id: patientUser.id,
        name: patientUser.name,
        email: patientUser.email,
        phone: patientUser.phone,
        dateOfBirth: patientUser.dateOfBirth,
        age: patientUser.age,
        medicalRecords: patientUser.medicalRecords,
        xrayImageUrls: patientUser.xrayImageUrls,
        hasDiabetes: patientUser.hasDiabetes,
        hasHighBloodPressure: patientUser.hasHighBloodPressure,
        hasStrokeOrHeartAttackHistory: patientUser.hasStrokeOrHeartAttackHistory,
        hasBleedingDisorders: patientUser.hasBleedingDisorders,
        hasAllergy: patientUser.hasAllergy,
        allergySpecifics: patientUser.allergySpecifics,
        hasAsthma: patientUser.hasAsthma,
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
  const patientUserIndex = db.users.findIndex(u => u.id === patientId && u.role === 'patient');

  if (patientUserIndex === -1) {
    return NextResponse.json({ message: "Patient not found" }, { status: 404 });
  }

  db.users.splice(patientUserIndex, 1);

  // Also remove from the separate db.patients array
  const patientRecordIndex = db.patients.findIndex(p => p.id === patientId);
  if (patientRecordIndex !== -1) {
      db.patients.splice(patientRecordIndex, 1);
  }
  
  // Consider what to do with related data (appointments, treatment plans, etc.) - cascading deletes or archiving.
  // For this mock, we'll just remove the patient.

  return NextResponse.json({ message: "Patient deleted successfully" }, { status: 200 });
}
