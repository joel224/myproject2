
// src/app/api/patients/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { generateId } from '@/lib/mockServerDb'; 
import { getDb } from '@/lib/db'; 
import * as admin from 'firebase-admin';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

// Initialize Firebase Admin
try {
    getFirebaseAdminApp();
} catch (e) {
    console.error("Firebase Admin SDK initialization error on patient creation route:", e);
}


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
    const db = await getDb();
    const patients = await db.all("SELECT * FROM patients");

    return NextResponse.json(patients, { status: 200 });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ message: 'Error fetching patients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const validation = createPatientSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const patientData = validation.data;
    
    const existingPatient = await db.get('SELECT id FROM patients WHERE email = ?', patientData.email);
    if (existingPatient) {
        return NextResponse.json({ message: "A patient with this email already has a clinical record." }, { status: 409 });
    }
    
    // Check if a user with this email already exists (e.g., they signed up themselves)
    let user = await db.get('SELECT id FROM users WHERE email = ?', patientData.email);
    let userId: string;
    let firebaseUid: string;

    const now = new Date().toISOString();

    if (user) {
        // User exists, link to them
        userId = user.id;
        firebaseUid = user.id;
    } else {
        // No user exists, create one in both Firebase and our DB
        const firebaseUserRecord = await admin.auth().createUser({
            email: patientData.email,
            password: patientData.password, // This can be undefined if staff doesn't set one
            displayName: patientData.name,
        });
        firebaseUid = firebaseUserRecord.uid;
        userId = firebaseUid; // Use the UID from Firebase as our user ID

        await db.run(
            'INSERT INTO users (id, name, email, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
            userId, patientData.name, patientData.email, 'patient', now, now
        );
    }
    
    // Create the patient clinical record
    const newPatientId = generateId('pat_');
    const insertPatientStmt = `
      INSERT INTO patients (
        id, userId, name, email, phone, dateOfBirth, age, medicalRecords, xrayImageUrls,
        hasDiabetes, hasHighBloodPressure, hasStrokeOrHeartAttackHistory, hasBleedingDisorders,
        hasAllergy, allergySpecifics, hasAsthma, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.run(
      insertPatientStmt,
      newPatientId, userId, patientData.name, patientData.email, patientData.phone, patientData.dateOfBirth, patientData.age,
      patientData.medicalRecords, JSON.stringify(patientData.xrayImageUrls), patientData.hasDiabetes,
      patientData.hasHighBloodPressure, patientData.hasStrokeOrHeartAttackHistory, patientData.hasBleedingDisorders,
      patientData.hasAllergy, patientData.allergySpecifics, patientData.hasAsthma, now, now
    );

    const newPatientResponse = await db.get('SELECT * FROM patients WHERE id = ?', newPatientId);
    return NextResponse.json(newPatientResponse, { status: 201 });

  } catch (error: any) {
    console.error('Error creating patient:', error);
    if (error.code === 'auth/email-already-exists') {
        return NextResponse.json({ message: "This email is already registered for login. Please use the existing account." }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error creating patient', details: error.message }, { status: 500 });
  }
}
