
// src/app/api/patients/[patientId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import type { Patient } from '@/lib/types';
import type { UserAuth } from '@/lib/mockServerDb';
import { getDb } from '@/lib/db';

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
    const db = await getDb();
    const patientUser = await db.get("SELECT * FROM users WHERE id = ? AND role = 'patient'", patientId);

    if (!patientUser) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }
    
    // Deserialize JSON string for xrayImageUrls
    if (patientUser.xrayImageUrls) {
        patientUser.xrayImageUrls = JSON.parse(patientUser.xrayImageUrls);
    }

    const { passwordHash, ...patientResponse } = patientUser;
    return NextResponse.json(patientResponse, { status: 200 });

  } catch (error) {
    console.error(`Error fetching patient ${patientId}:`, error);
    return NextResponse.json({ message: 'Error fetching patient details' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: PatientRouteParams) {
  const { patientId } = params;
  const db = await getDb();

  try {
    const body = await request.json();
    const validation = updatePatientSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData = validation.data;
    
    const currentPatient = await db.get("SELECT * FROM users WHERE id = ? AND role = 'patient'", patientId);
    if (!currentPatient) {
        return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    if (updateData.email && updateData.email !== currentPatient.email) {
        const emailCollisionCheck = await db.get("SELECT id FROM users WHERE email = ? AND id != ?", [updateData.email, patientId]);
        if (emailCollisionCheck) {
          return NextResponse.json({ message: "Email already in use by another user." }, { status: 409 });
        }
    }
    
    const mergedData = { ...currentPatient, ...updateData };
    
    const updateUserStmt = `
      UPDATE users SET
        name = ?, email = ?, phone = ?, dateOfBirth = ?, age = ?, medicalRecords = ?, 
        xrayImageUrls = ?, hasDiabetes = ?, hasHighBloodPressure = ?, 
        hasStrokeOrHeartAttackHistory = ?, hasBleedingDisorders = ?, hasAllergy = ?, 
        allergySpecifics = ?, hasAsthma = ?, updatedAt = ?
      WHERE id = ?
    `;
    
    await db.run(
        updateUserStmt,
        mergedData.name, mergedData.email, mergedData.phone, mergedData.dateOfBirth, mergedData.age,
        mergedData.medicalRecords, JSON.stringify(mergedData.xrayImageUrls || []), mergedData.hasDiabetes,
        mergedData.hasHighBloodPressure, mergedData.hasStrokeOrHeartAttackHistory, mergedData.hasBleedingDisorders,
        mergedData.hasAllergy, mergedData.allergySpecifics, mergedData.hasAsthma, new Date().toISOString(),
        patientId
    );
    
    const updatedPatient = await db.get("SELECT * FROM users WHERE id = ?", patientId);
    const { passwordHash, ...patientResponse } = updatedPatient;

    return NextResponse.json(patientResponse, { status: 200 });

  } catch (error) {
    console.error(`Error updating patient ${patientId}:`, error);
    return NextResponse.json({ message: 'Error updating patient' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: PatientRouteParams) {
  const { patientId } = params;
  const db = await getDb();

  try {
    const patientUser = await db.get("SELECT * FROM users WHERE id = ?", patientId);
    
    if (!patientUser) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    // Instead of deleting the user record, we scrub the clinical data and demote their role.
    // This preserves their login for historical purposes but removes patient-specific data access.
    if (patientUser.role === 'patient') {
        const scrubStmt = `
            UPDATE users SET
              role = 'user', -- A generic, non-clinical role
              dateOfBirth = NULL, age = NULL, medicalRecords = NULL, xrayImageUrls = NULL,
              hasDiabetes = NULL, hasHighBloodPressure = NULL, hasStrokeOrHeartAttackHistory = NULL,
              hasBleedingDisorders = NULL, hasAllergy = NULL, allergySpecifics = NULL,
              hasAsthma = NULL, updatedAt = ?
            WHERE id = ?
        `;
        await db.run(scrubStmt, new Date().toISOString(), patientId);
        
        // Also remove their appointments, treatment plans, etc. from related tables.
        // This is a cascade-like operation done manually.
        await db.run('DELETE FROM appointments WHERE patientId = ?', patientId);
        // Add similar DELETE statements for treatmentPlans, progressNotes, invoices, conversations, messages...

        return NextResponse.json({ message: "Patient clinical data deleted successfully. User login account remains." }, { status: 200 });
    } else {
        // If they are not a patient (e.g., staff), just delete the user record entirely.
        await db.run('DELETE FROM users WHERE id = ?', patientId);
        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    }

  } catch (error) {
    console.error(`Error deleting patient ${patientId}:`, error);
    return NextResponse.json({ message: 'Error deleting patient' }, { status: 500 });
  }
}
