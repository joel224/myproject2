
// src/app/api/patients/[patientId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z, ZodError } from 'zod';
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
}).partial();


interface PatientRouteParams {
  params: {
    patientId: string;
  }
}

export async function GET(request: NextRequest, { params }: PatientRouteParams) {
  const { patientId } = params;
  try {
    const db = await getDb();
    const patient = await db.get("SELECT * FROM patients WHERE id = ?", patientId);

    if (!patient) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }
    
    // Deserialize JSON string for xrayImageUrls
    if (patient.xrayImageUrls) {
        try {
            patient.xrayImageUrls = JSON.parse(patient.xrayImageUrls);
        } catch (e) {
            console.error(`Invalid JSON in xrayImageUrls for patient ${patientId}:`, patient.xrayImageUrls);
            patient.xrayImageUrls = []; // Default to empty array on parse error
        }
    } else {
        patient.xrayImageUrls = [];
    }

    return NextResponse.json(patient, { status: 200 });

  } catch (error) {
    console.error(`Error fetching patient ${patientId}:`, error);
    return NextResponse.json({ message: 'Error fetching patient details' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: PatientRouteParams) {
  const { patientId } = params;
  const db = await getDb();
  let body: any;

  try {
    body = await request.json();
  } catch (e) {
    console.error('Failed to parse JSON body', e);
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  console.log('PUT /api/patients/%s body:', patientId, JSON.stringify(body, null, 2));


  try {
    const validatedData = updatePatientSchema.parse(body);
    
    const currentPatient = await db.get("SELECT * FROM patients WHERE id = ?", patientId);
    if (!currentPatient) {
        return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    if (validatedData.email && validatedData.email !== currentPatient.email) {
        const emailCollisionCheck = await db.get("SELECT id FROM patients WHERE email = ? AND id != ?", [validatedData.email, patientId]);
        if (emailCollisionCheck) {
          return NextResponse.json({ message: "Email already in use by another patient." }, { status: 409 });
        }
    }
    
    // Merge validated data with current data to handle partial updates
    const mergedData = { ...currentPatient, ...validatedData };
    
    const updatePatientStmt = `
      UPDATE patients SET
        name = ?, email = ?, phone = ?, dateOfBirth = ?, age = ?, medicalRecords = ?, 
        xrayImageUrls = ?, hasDiabetes = ?, hasHighBloodPressure = ?, 
        hasStrokeOrHeartAttackHistory = ?, hasBleedingDisorders = ?, hasAllergy = ?, 
        allergySpecifics = ?, hasAsthma = ?, updatedAt = ?
      WHERE id = ?
    `;
    
    await db.run(
        updatePatientStmt,
        mergedData.name, mergedData.email, mergedData.phone, mergedData.dateOfBirth, mergedData.age,
        mergedData.medicalRecords, 
        JSON.stringify(mergedData.xrayImageUrls || []), // Ensure xrayImageUrls is always an array
        mergedData.hasDiabetes,
        mergedData.hasHighBloodPressure, mergedData.hasStrokeOrHeartAttackHistory, mergedData.hasBleedingDisorders,
        mergedData.hasAllergy, mergedData.allergySpecifics, mergedData.hasAsthma, new Date().toISOString(),
        patientId
    );
    
    const updatedPatient = await db.get("SELECT * FROM patients WHERE id = ?", patientId);
    
    // Also update the linked user's name and email if they changed
    if (updatedPatient.userId && (validatedData.name || validatedData.email)) {
        const updateUserStmt = `UPDATE users SET name = ?, email = ? WHERE id = ?`;
        await db.run(updateUserStmt, updatedPatient.name, updatedPatient.email, updatedPatient.userId);
    }
    
    return NextResponse.json(updatedPatient, { status: 200 });

  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Zod validation errors:', JSON.stringify(error.errors, null, 2));
      return NextResponse.json({ message: "Validation failed", errors: error.errors }, { status: 400 });
    }
    console.error(`Unexpected error updating patient ${patientId}:`, error);
    return NextResponse.json({ message: 'Error updating patient' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: PatientRouteParams) {
  const { patientId } = params;
  const db = await getDb();

  try {
    const patientToDelete = await db.get("SELECT * FROM patients WHERE id = ?", patientId);
    
    if (!patientToDelete) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    // This is a hard delete of the clinical record.
    // The associated user login account is NOT deleted.
    await db.run('DELETE FROM appointments WHERE patientId = ?', patientId);
    // Add similar DELETE statements for treatmentPlans, progressNotes, invoices, etc.
    // await db.run('DELETE FROM treatment_plans WHERE patientId = ?', patientId);
    // await db.run('DELETE FROM invoices WHERE patientId = ?', patientId);
    // const conversation = await db.get('SELECT id FROM conversations WHERE patientId = ?', patientId);
    // if (conversation) {
    //     await db.run('DELETE FROM messages WHERE conversationId = ?', conversation.id);
    //     await db.run('DELETE FROM conversations WHERE id = ?', conversation.id);
    // }
    
    await db.run('DELETE FROM patients WHERE id = ?', patientId);

    return NextResponse.json({ message: "Patient clinical record deleted successfully. User login account remains." }, { status: 200 });

  } catch (error) {
    console.error(`Error deleting patient ${patientId}:`, error);
    return NextResponse.json({ message: 'Error deleting patient' }, { status: 500 });
  }
}
