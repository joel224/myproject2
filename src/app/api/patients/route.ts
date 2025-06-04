
// src/app/api/patients/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db, generateId, authorize, UserAuth } from '@/lib/mockServerDb'; // Assuming UserAuth is exported
import type { Patient } from '@/lib/types';

// Schema for creating a new patient
const createPatientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(), // ISO date string e.g. "YYYY-MM-DD"
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
  password: z.string().min(6, "Password must be at least 6 characters").optional(), // For creating user account
});

/**
 * Handles GET requests to /api/patients
 * @param request - The incoming NextRequest object
 * @returns A NextResponse object containing a list of patients or an error.
 */
export async function GET(request: NextRequest) {
  // const authResult = await authorize(request, 'staff'); 
  // if (!authResult.authorized || !authResult.user) {
  //   return authResult.error;
  // }

  const patientUsers = db.users.filter(u => u.role === 'patient').map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    dateOfBirth: u.dateOfBirth,
    age: u.age,
    medicalRecords: u.medicalRecords,
    xrayImageUrls: u.xrayImageUrls,
    hasDiabetes: u.hasDiabetes,
    hasHighBloodPressure: u.hasHighBloodPressure,
    hasStrokeOrHeartAttackHistory: u.hasStrokeOrHeartAttackHistory,
    hasBleedingDisorders: u.hasBleedingDisorders,
    hasAllergy: u.hasAllergy,
    allergySpecifics: u.allergySpecifics,
    hasAsthma: u.hasAsthma,
  }));
  
  return NextResponse.json(patientUsers, { status: 200 });
}

/**
 * Handles POST requests to /api/patients to create a new patient.
 * @param request - The incoming NextRequest object
 * @returns A NextResponse object containing the new patient or an error.
 */
export async function POST(request: NextRequest) {
  // const authResult = await authorize(request, 'staff');
  // if (!authResult.authorized || !authResult.user) {
  //   return authResult.error;
  // }

  try {
    const body = await request.json();
    const validation = createPatientSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { 
        name, email, phone, dateOfBirth, age, 
        medicalRecords, xrayImageUrls, 
        hasDiabetes, hasHighBloodPressure, hasStrokeOrHeartAttackHistory, 
        hasBleedingDisorders, hasAllergy, allergySpecifics, hasAsthma, 
        password 
    } = validation.data;

    if (db.users.find(u => u.email === email)) {
      return NextResponse.json({ message: "A user with this email already exists." }, { status: 409 });
    }

    const newUserId = generateId('user_');
    const passwordHash = password ? `$2a$10$${generateId('fakeHash')}${password.substring(0,3)}` : `$2a$10$defaultHash${generateId()}`;

    const newUserForPatient: UserAuth = {
      id: newUserId,
      name,
      email,
      passwordHash,
      role: 'patient',
      phone,
      dateOfBirth,
      age,
      medicalRecords,
      xrayImageUrls,
      hasDiabetes,
      hasHighBloodPressure,
      hasStrokeOrHeartAttackHistory,
      hasBleedingDisorders,
      hasAllergy,
      allergySpecifics: hasAllergy ? allergySpecifics : undefined, // Only store specifics if allergy is true
      hasAsthma,
    };
    db.users.push(newUserForPatient);

    // Also update the separate db.patients array if it's being used as primary source for Patient type
     const newPatientRecord: Patient = {
      id: newUserId,
      name,
      email,
      phone,
      dateOfBirth,
      age,
      medicalRecords,
      xrayImageUrls,
      hasDiabetes,
      hasHighBloodPressure,
      hasStrokeOrHeartAttackHistory,
      hasBleedingDisorders,
      hasAllergy,
      allergySpecifics: hasAllergy ? allergySpecifics : undefined,
      hasAsthma,
    };
    const patientIndex = db.patients.findIndex(p => p.id === newUserId);
    if (patientIndex !== -1) {
        db.patients[patientIndex] = newPatientRecord;
    } else {
        db.patients.push(newPatientRecord);
    }


    const patientToReturn = { ...newPatientRecord }; // Return the patient object

    return NextResponse.json(patientToReturn, { status: 201 });

  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ message: 'Error creating patient' }, { status: 500 });
  }
}
