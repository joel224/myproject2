
// src/app/api/patients/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db, generateId } from '@/lib/mockServerDb'; // Use mock DB
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
  // Password field removed as per previous logic for staff creation
});

export async function GET(request: NextRequest) {
  try {
    const patientUsers = db.users.filter(u => u.role === 'patient');
    const patientsList: Patient[] = patientUsers.map(data => ({
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      age: data.age,
      medicalRecords: data.medicalRecords,
      xrayImageUrls: data.xrayImageUrls || [],
      hasDiabetes: data.hasDiabetes,
      hasHighBloodPressure: data.hasHighBloodPressure,
      hasStrokeOrHeartAttackHistory: data.hasStrokeOrHeartAttackHistory,
      hasBleedingDisorders: data.hasBleedingDisorders,
      hasAllergy: data.hasAllergy,
      allergySpecifics: data.allergySpecifics,
      hasAsthma: data.hasAsthma,
    }));
    return NextResponse.json(patientsList, { status: 200 });
  } catch (error) {
    console.error('Error fetching patients from mock DB:', error);
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

    if (db.users.some(u => u.email === patientData.email)) {
      return NextResponse.json({ message: "A user with this email already exists." }, { status: 409 });
    }

    const newPatientId = generateId('pat_');
    const now = new Date().toISOString();

    const newUserAuth: UserAuth = {
      id: newPatientId,
      name: patientData.name,
      email: patientData.email,
      role: 'patient',
      phone: patientData.phone || undefined,
      dateOfBirth: patientData.dateOfBirth || undefined,
      age: patientData.age || undefined,
      medicalRecords: patientData.medicalRecords || undefined,
      xrayImageUrls: patientData.xrayImageUrls || [],
      hasDiabetes: patientData.hasDiabetes || false,
      hasHighBloodPressure: patientData.hasHighBloodPressure || false,
      hasStrokeOrHeartAttackHistory: patientData.hasStrokeOrHeartAttackHistory || false,
      hasBleedingDisorders: patientData.hasBleedingDisorders || false,
      hasAllergy: patientData.hasAllergy || false,
      allergySpecifics: patientData.hasAllergy ? (patientData.allergySpecifics || undefined) : undefined,
      hasAsthma: patientData.hasAsthma || false,
      createdAt: now,
      updatedAt: now,
      // No passwordHash set here, as per staff creation flow
    };

    db.users.push(newUserAuth);

    const newPatientResponse: Patient = {
      id: newUserAuth.id,
      name: newUserAuth.name,
      email: newUserAuth.email,
      phone: newUserAuth.phone,
      dateOfBirth: newUserAuth.dateOfBirth,
      age: newUserAuth.age,
      medicalRecords: newUserAuth.medicalRecords,
      xrayImageUrls: newUserAuth.xrayImageUrls,
      hasDiabetes: newUserAuth.hasDiabetes,
      hasHighBloodPressure: newUserAuth.hasHighBloodPressure,
      hasStrokeOrHeartAttackHistory: newUserAuth.hasStrokeOrHeartAttackHistory,
      hasBleedingDisorders: newUserAuth.hasBleedingDisorders,
      hasAllergy: newUserAuth.hasAllergy,
      allergySpecifics: newUserAuth.allergySpecifics,
      hasAsthma: newUserAuth.hasAsthma,
    };

    return NextResponse.json(newPatientResponse, { status: 201 });

  } catch (error) {
    console.error('Error creating patient in mock DB:', error);
    return NextResponse.json({ message: 'Error creating patient' }, { status: 500 });
  }
}
