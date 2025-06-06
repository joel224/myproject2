
// src/app/api/patients/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db as firestoreDb } from '@/lib/firebase'; // Use actual Firestore instance
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import type { Patient } from '@/lib/types';
import type { UserAuth } from '@/lib/mockServerDb'; // For UserAuth type

// Schema for creating a new patient profile in Firestore's 'users' collection
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
  // Password field removed from staff creation API, should be handled via auth flows
});

/**
 * Handles GET requests to /api/patients - Fetches patients from Firestore
 * @param request - The incoming NextRequest object
 * @returns A NextResponse object containing a list of patients or an error.
 */
export async function GET(request: NextRequest) {
  // TODO: Add proper authorization check using Firebase Auth context if needed for staff access
  try {
    const usersCollectionRef = collection(firestoreDb, 'users');
    const q = query(usersCollectionRef, where('role', '==', 'patient'));
    const querySnapshot = await getDocs(q);

    const patientsList: Patient[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as UserAuth; // UserAuth contains all patient fields
      patientsList.push({
        id: doc.id, // Use Firestore document ID
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
      });
    });
    return NextResponse.json(patientsList, { status: 200 });
  } catch (error) {
    console.error('Error fetching patients from Firestore:', error);
    return NextResponse.json({ message: 'Error fetching patients' }, { status: 500 });
  }
}

/**
 * Handles POST requests to /api/patients to create a new patient in Firestore.
 * @param request - The incoming NextRequest object
 * @returns A NextResponse object containing the new patient or an error.
 */
export async function POST(request: NextRequest) {
  // TODO: Add proper authorization check for staff
  try {
    const body = await request.json();
    const validation = createPatientSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const patientData = validation.data;

    // Check if email already exists
    const usersCollectionRef = collection(firestoreDb, 'users');
    const q = query(usersCollectionRef, where('email', '==', patientData.email));
    const existingUserSnapshot = await getDocs(q);

    if (!existingUserSnapshot.empty) {
      return NextResponse.json({ message: "A user with this email already exists." }, { status: 409 });
    }

    const newPatientDoc: Omit<UserAuth, 'id' | 'passwordHash'> = {
      ...patientData,
      role: 'patient',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Ensure optional fields are handled if not present in patientData
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
    };

    const docRef = await addDoc(usersCollectionRef, newPatientDoc);

    const newPatient: Patient = {
      id: docRef.id,
      ...patientData, // Spread validated data, ensuring all fields are present
    };

    return NextResponse.json(newPatient, { status: 201 });

  } catch (error) {
    console.error('Error creating patient in Firestore:', error);
    return NextResponse.json({ message: 'Error creating patient' }, { status: 500 });
  }
}
