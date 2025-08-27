
// src/app/api/patients/[patientId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { dbClient } from '@/lib/db';
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
});

interface PatientRouteParams {
  params: {
    patientId: string;
  }
}

export async function GET(request: NextRequest, { params }: PatientRouteParams) {
  const { patientId } = params;
  try {
    const userResult = await dbClient.query(`
      SELECT id, name, email, phone, date_of_birth, age, medical_records, 
             xray_image_urls, has_diabetes, has_high_blood_pressure, 
             has_stroke_or_heart_attack_history, has_bleeding_disorders, 
             has_allergy, allergy_specifics, has_asthma 
      FROM users WHERE id = $1 AND role = 'patient'
    `, [patientId]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }
    
    const userData = userResult.rows[0];

    const patientResponse: Patient = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      dateOfBirth: userData.date_of_birth,
      age: userData.age,
      medicalRecords: userData.medical_records,
      xrayImageUrls: userData.xray_image_urls || [],
      hasDiabetes: userData.has_diabetes,
      hasHighBloodPressure: userData.has_high_blood_pressure,
      hasStrokeOrHeartAttackHistory: userData.has_stroke_or_heart_attack_history,
      hasBleedingDisorders: userData.has_bleeding_disorders,
      hasAllergy: userData.has_allergy,
      allergySpecifics: userData.allergy_specifics,
      hasAsthma: userData.has_asthma,
    };

    return NextResponse.json(patientResponse, { status: 200 });

  } catch (error) {
    console.error(`Error fetching patient ${patientId}:`, error);
     if (error instanceof Error && error.message.includes("Database client not initialized")) {
        return NextResponse.json({ message: "Server configuration error: Database not connected." }, { status: 503 });
    }
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
    
    const patientCheck = await dbClient.query("SELECT email FROM users WHERE id = $1 AND role = 'patient'", [patientId]);
    if (patientCheck.rows.length === 0) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    if (updateData.email && updateData.email !== patientCheck.rows[0].email) {
        const emailCollisionCheck = await dbClient.query("SELECT id FROM users WHERE email = $1 AND id != $2", [updateData.email, patientId]);
        if (emailCollisionCheck.rows.length > 0) {
          return NextResponse.json({ message: "Email already in use by another user." }, { status: 409 });
        }
    }
    
    // Dynamically build query to update only provided fields
    const fieldsToUpdate: { name: string, value: any, placeholder: string }[] = [];
    let placeholderIndex = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        fieldsToUpdate.push({ name: dbKey, value: value, placeholder: `$${placeholderIndex++}` });
      }
    });

    if (fieldsToUpdate.length === 0) {
        return NextResponse.json({ message: "No fields to update." }, { status: 200 });
    }

    const setClause = fieldsToUpdate.map(f => `${f.name} = ${f.placeholder}`).join(', ');
    const queryValues = fieldsToUpdate.map(f => f.value);
    
    const updateQuery = `
        UPDATE users 
        SET ${setClause}, updated_at = NOW() 
        WHERE id = $${placeholderIndex}
        RETURNING id, name, email, phone, date_of_birth, age, medical_records, 
                  xray_image_urls, has_diabetes, has_high_blood_pressure, 
                  has_stroke_or_heart_attack_history, has_bleeding_disorders, 
                  has_allergy, allergy_specifics, has_asthma;
    `;

    const updatedResult = await dbClient.query(updateQuery, [...queryValues, patientId]);
    const updatedData = updatedResult.rows[0];

    const patientResponse: Patient = {
      id: updatedData.id,
      name: updatedData.name,
      email: updatedData.email,
      phone: updatedData.phone,
      dateOfBirth: updatedData.date_of_birth,
      age: updatedData.age,
      medicalRecords: updatedData.medical_records,
      xrayImageUrls: updatedData.xray_image_urls || [],
      hasDiabetes: updatedData.has_diabetes,
      hasHighBloodPressure: updatedData.has_high_blood_pressure,
      hasStrokeOrHeartAttackHistory: updatedData.has_stroke_or_heart_attack_history,
      hasBleedingDisorders: updatedData.has_bleeding_disorders,
      hasAllergy: updatedData.has_allergy,
      allergySpecifics: updatedData.allergy_specifics,
      hasAsthma: updatedData.has_asthma,
    };

    return NextResponse.json(patientResponse, { status: 200 });

  } catch (error) {
    console.error(`Error updating patient ${patientId}:`, error);
     if (error instanceof Error && error.message.includes("Database client not initialized")) {
        return NextResponse.json({ message: "Server configuration error: Database not connected." }, { status: 503 });
    }
    return NextResponse.json({ message: 'Error updating patient' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: PatientRouteParams) {
  const { patientId } = params;

  try {
    const deleteResult = await dbClient.query("DELETE FROM users WHERE id = $1 AND role = 'patient'", [patientId]);
    if (deleteResult.rowCount === 0) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }
    
    // In a real app with foreign keys and cascade rules, this might be all you need.
    // Here, you might need to manually delete related data if not using cascades.
    // e.g., DELETE FROM appointments WHERE patient_id = $1, etc.

    return NextResponse.json({ message: "Patient deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error(`Error deleting patient ${patientId}:`, error);
     if (error instanceof Error && error.message.includes("Database client not initialized")) {
        return NextResponse.json({ message: "Server configuration error: Database not connected." }, { status: 503 });
    }
    return NextResponse.json({ message: 'Error deleting patient' }, { status: 500 });
  }
}
