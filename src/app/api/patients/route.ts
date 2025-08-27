
// src/app/api/patients/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { dbClient } from '@/lib/db'; 
import { generateId } from '@/lib/mockServerDb'; 
import bcrypt from 'bcryptjs';
import type { Patient } from '@/lib/types';
import type { UserAuth } from '@/lib/mockServerDb';

const createPatientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  age: z.number().int().min(0).optional(),
  medicalRecords: z.string().optional(),
  xrayImageUrls: z.array(z.string().url()).optional().default([]),
  hasDiabetes: z.boolean().optional().default(false),
  hasHighBloodPressure: z.boolean().optional().default(false),
  hasStrokeOrHeartAttackHistory: z.boolean().optional().default(false),
  hasBleedingDisorders: z.boolean().optional().default(false),
  hasAllergy: z.boolean().optional().default(false),
  allergySpecifics: z.string().optional(),
  hasAsthma: z.boolean().optional().default(false),
  password: z.string().min(6).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const patientUsersResult = await dbClient.query(`
      SELECT id, name, email, phone, date_of_birth, age, medical_records, 
             xray_image_urls, has_diabetes, has_high_blood_pressure, 
             has_stroke_or_heart_attack_history, has_bleeding_disorders, 
             has_allergy, allergy_specifics, has_asthma 
      FROM users WHERE role = 'patient' ORDER BY created_at DESC
    `);
    const patientsList: Patient[] = patientUsersResult.rows.map(data => ({
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.date_of_birth,
      age: data.age,
      medicalRecords: data.medical_records,
      xrayImageUrls: data.xray_image_urls || [],
      hasDiabetes: data.has_diabetes,
      hasHighBloodPressure: data.has_high_blood_pressure,
      hasStrokeOrHeartAttackHistory: data.has_stroke_or_heart_attack_history,
      hasBleedingDisorders: data.has_bleeding_disorders,
      hasAllergy: data.has_allergy,
      allergySpecifics: data.allergy_specifics,
      hasAsthma: data.has_asthma,
    }));
    return NextResponse.json(patientsList, { status: 200 });
  } catch (error) {
    console.error('Error fetching patients:', error);
    if (error instanceof Error && error.message.includes("Database client not initialized")) {
        return NextResponse.json({ message: "Server configuration error: Database not connected." }, { status: 503 });
    }
    return NextResponse.json({ message: 'Error fetching patients' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createPatientSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const patientData = validation.data;

    const existingUserResult = await dbClient.query('SELECT id FROM users WHERE email = $1', [patientData.email]);
    if (existingUserResult.rows.length > 0) {
      return NextResponse.json({ message: "A user with this email already exists." }, { status: 409 });
    }

    let passwordHash: string | null = null;
    if (patientData.password) {
        const saltRounds = 10;
        passwordHash = await bcrypt.hash(patientData.password, saltRounds);
    }
    
    // Note the change to snake_case for database columns
    const insertQuery = `
      INSERT INTO users (
        name, email, password_hash, role, phone, date_of_birth, age, medical_records, 
        xray_image_urls, has_diabetes, has_high_blood_pressure, 
        has_stroke_or_heart_attack_history, has_bleeding_disorders, 
        has_allergy, allergy_specifics, has_asthma
      ) VALUES (
        $1, $2, $3, 'patient', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      ) RETURNING id, name, email, phone, date_of_birth, age, medical_records, 
             xray_image_urls, has_diabetes, has_high_blood_pressure, 
             has_stroke_or_heart_attack_history, has_bleeding_disorders, 
             has_allergy, allergy_specifics, has_asthma;
    `;
    
    const queryParams = [
        patientData.name,
        patientData.email,
        passwordHash,
        patientData.phone,
        patientData.dateOfBirth,
        patientData.age,
        patientData.medicalRecords,
        patientData.xrayImageUrls,
        patientData.hasDiabetes,
        patientData.hasHighBloodPressure,
        patientData.hasStrokeOrHeartAttackHistory,
        patientData.hasBleedingDisorders,
        patientData.hasAllergy,
        patientData.allergySpecifics,
        patientData.hasAsthma,
    ];

    const newUserResult = await dbClient.query(insertQuery, queryParams);
    const newPatientDbRecord = newUserResult.rows[0];

    const newPatientResponse: Patient = {
      id: newPatientDbRecord.id,
      name: newPatientDbRecord.name,
      email: newPatientDbRecord.email,
      phone: newPatientDbRecord.phone,
      dateOfBirth: newPatientDbRecord.date_of_birth,
      age: newPatientDbRecord.age,
      medicalRecords: newPatientDbRecord.medical_records,
      xrayImageUrls: newPatientDbRecord.xray_image_urls || [],
      hasDiabetes: newPatientDbRecord.has_diabetes,
      hasHighBloodPressure: newPatientDbRecord.has_high_blood_pressure,
      hasStrokeOrHeartAttackHistory: newPatientDbRecord.has_stroke_or_heart_attack_history,
      hasBleedingDisorders: newPatientDbRecord.has_bleeding_disorders,
      hasAllergy: newPatientDbRecord.has_allergy,
      allergySpecifics: newPatientDbRecord.allergy_specifics,
      hasAsthma: newPatientDbRecord.has_asthma,
    };

    return NextResponse.json(newPatientResponse, { status: 201 });

  } catch (error) {
    console.error('Error creating patient:', error);
    if (error instanceof Error && 'code' in error && (error as any).code === '23505') {
       return NextResponse.json({ message: "A user with this email may already exist." }, { status: 409 });
    }
     if (error instanceof Error && error.message.includes("Database client not initialized")) {
        return NextResponse.json({ message: "Server configuration error: Database not connected." }, { status: 503 });
    }
    return NextResponse.json({ message: 'Error creating patient' }, { status: 500 });
  }
}
