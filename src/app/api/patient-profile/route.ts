
// src/app/api/patient-profile/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { dbClient } from '@/lib/db';
import { auth as adminAuth } from 'firebase-admin';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

// Initialize Firebase Admin SDK
getFirebaseAdminApp();

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized: Missing or invalid token' }, { status: 401 });
  }
  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Verify the Firebase ID token
    const decodedToken = await adminAuth().verifyIdToken(idToken);
    const userEmail = decodedToken.email;

    if (!userEmail) {
      return NextResponse.json({ message: 'Forbidden: No email associated with this account.' }, { status: 403 });
    }

    // Find patient in your PostgreSQL database by email
    const patientResult = await dbClient.query(
      'SELECT id, name, email, phone, date_of_birth, age, medical_records, xray_image_urls, has_diabetes, has_high_blood_pressure, has_stroke_or_heart_attack_history, has_bleeding_disorders, has_allergy, allergy_specifics, has_asthma FROM users WHERE email = $1 AND role = $2',
      [userEmail, 'patient']
    );

    if (patientResult.rows.length === 0) {
      return NextResponse.json({ message: 'No patient record found for this account. Please contact the clinic to have your online account linked.' }, { status: 404 });
    }

    const patientData = patientResult.rows[0];

    // Map database snake_case columns to camelCase for the frontend type
    const patientResponse = {
      id: patientData.id,
      name: patientData.name,
      email: patientData.email,
      phone: patientData.phone,
      dateOfBirth: patientData.date_of_birth,
      age: patientData.age,
      medicalRecords: patientData.medical_records,
      xrayImageUrls: patientData.xray_image_urls || [],
      hasDiabetes: patientData.has_diabetes,
      hasHighBloodPressure: patientData.has_high_blood_pressure,
      hasStrokeOrHeartAttackHistory: patientData.has_stroke_or_heart_attack_history,
      hasBleedingDisorders: patientData.has_bleeding_disorders,
      hasAllergy: patientData.has_allergy,
      allergySpecifics: patientData.allergy_specifics,
      hasAsthma: patientData.has_asthma,
    };

    return NextResponse.json(patientResponse, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching patient profile:', error);
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json({ message: 'Token expired. Please log in again.' }, { status: 401 });
    }
     if (error.code?.startsWith('auth/')) {
      return NextResponse.json({ message: 'Forbidden: Invalid authentication token.' }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Database client not initialized")) {
        return NextResponse.json({ message: "Server configuration error: Database not connected." }, { status: 503 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
