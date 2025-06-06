
// src/app/api/patients/[patientId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db as firestoreDb } from '@/lib/firebase'; // Use actual Firestore instance
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import type { Patient } from '@/lib/types';
import type { UserAuth } from '@/lib/mockServerDb';

// Schema for updating patient details in Firestore
const updatePatientSchema = z.object({
  name: z.string().min(2, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(), // Email uniqueness should be handled if changed
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

/**
 * GET /api/patients/{patientId} - Get specific patient details from Firestore
 */
export async function GET(request: NextRequest, { params }: PatientRouteParams) {
  // TODO: Add proper authorization
  const { patientId } = params;
  try {
    const patientDocRef = doc(firestoreDb, 'users', patientId);
    const patientSnap = await getDoc(patientDocRef);

    if (!patientSnap.exists()) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    const patientData = patientSnap.data() as UserAuth;
    if (patientData.role !== 'patient') {
        return NextResponse.json({ message: "User is not a patient" }, { status: 404 });
    }

    const patientResponse: Patient = {
      id: patientSnap.id,
      name: patientData.name,
      email: patientData.email,
      phone: patientData.phone,
      dateOfBirth: patientData.dateOfBirth,
      age: patientData.age,
      medicalRecords: patientData.medicalRecords,
      xrayImageUrls: patientData.xrayImageUrls || [],
      hasDiabetes: patientData.hasDiabetes,
      hasHighBloodPressure: patientData.hasHighBloodPressure,
      hasStrokeOrHeartAttackHistory: patientData.hasStrokeOrHeartAttackHistory,
      hasBleedingDisorders: patientData.hasBleedingDisorders,
      hasAllergy: patientData.hasAllergy,
      allergySpecifics: patientData.allergySpecifics,
      hasAsthma: patientData.hasAsthma,
    };
    return NextResponse.json(patientResponse, { status: 200 });

  } catch (error) {
    console.error(`Error fetching patient ${patientId} from Firestore:`, error);
    return NextResponse.json({ message: 'Error fetching patient details' }, { status: 500 });
  }
}

/**
 * PUT /api/patients/{patientId} - Update patient details in Firestore
 */
export async function PUT(request: NextRequest, { params }: PatientRouteParams) {
  // TODO: Add proper authorization
  const { patientId } = params;

  try {
    const body = await request.json();
    const validation = updatePatientSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData = validation.data;
    
    const patientDocRef = doc(firestoreDb, 'users', patientId);
    const patientSnap = await getDoc(patientDocRef);

    if (!patientSnap.exists() || patientSnap.data()?.role !== 'patient') {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    // Prepare data for Firestore, handling undefined for nullable fields
    const firestoreUpdateData: Partial<UserAuth> = { ...updateData, updatedAt: serverTimestamp() };
    Object.keys(firestoreUpdateData).forEach(key => {
        const typedKey = key as keyof Partial<UserAuth>;
        if (firestoreUpdateData[typedKey] === null) {
            firestoreUpdateData[typedKey] = undefined; // Firestore deletes fields set to undefined
        }
    });
     if (updateData.hasAllergy === false) {
        firestoreUpdateData.allergySpecifics = undefined; // Clear specifics if allergy is set to false
    }


    await updateDoc(patientDocRef, firestoreUpdateData);
    
    // Fetch the updated document to return it
    const updatedPatientSnap = await getDoc(patientDocRef);
    const updatedPatientData = updatedPatientSnap.data() as UserAuth;

     const patientResponse: Patient = {
      id: updatedPatientSnap.id,
      name: updatedPatientData.name,
      email: updatedPatientData.email,
      phone: updatedPatientData.phone,
      dateOfBirth: updatedPatientData.dateOfBirth,
      age: updatedPatientData.age,
      medicalRecords: updatedPatientData.medicalRecords,
      xrayImageUrls: updatedPatientData.xrayImageUrls || [],
      hasDiabetes: updatedPatientData.hasDiabetes,
      hasHighBloodPressure: updatedPatientData.hasHighBloodPressure,
      hasStrokeOrHeartAttackHistory: updatedPatientData.hasStrokeOrHeartAttackHistory,
      hasBleedingDisorders: updatedPatientData.hasBleedingDisorders,
      hasAllergy: updatedPatientData.hasAllergy,
      allergySpecifics: updatedPatientData.allergySpecifics,
      hasAsthma: updatedPatientData.hasAsthma,
    };

    return NextResponse.json(patientResponse, { status: 200 });

  } catch (error) {
    console.error(`Error updating patient ${patientId} in Firestore:`, error);
    // Handle specific errors like email collision if necessary
    return NextResponse.json({ message: 'Error updating patient' }, { status: 500 });
  }
}

/**
 * DELETE /api/patients/{patientId} - Delete a patient from Firestore
 */
export async function DELETE(request: NextRequest, { params }: PatientRouteParams) {
  // TODO: Add proper authorization
  const { patientId } = params;

  try {
    const patientDocRef = doc(firestoreDb, 'users', patientId);
    const patientSnap = await getDoc(patientDocRef);

    if (!patientSnap.exists() || patientSnap.data()?.role !== 'patient') {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    await deleteDoc(patientDocRef);
    
    // Consider what to do with related data (appointments, treatment plans, etc.)
    // This would typically involve more complex deletion logic or archiving.
    // For now, we just delete the patient's user record.

    return NextResponse.json({ message: "Patient deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error(`Error deleting patient ${patientId} from Firestore:`, error);
    return NextResponse.json({ message: 'Error deleting patient' }, { status: 500 });
  }
}
