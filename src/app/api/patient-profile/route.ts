
// src/app/api/patient-profile/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/mockServerDb'; // Using mock DB
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

// Initialize Firebase Admin SDK
// This might throw an error if config is not set, which is expected.
try {
  getFirebaseAdminApp();
} catch (e: any) {
  console.warn("Firebase Admin SDK not initialized. API routes requiring it will fail. Error: ", e.message);
}


export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized: Missing or invalid token' }, { status: 401 });
  }
  const idToken = authHeader.split('Bearer ')[1];

  try {
    const admin = await import('firebase-admin');
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userEmail = decodedToken.email;

    if (!userEmail) {
      return NextResponse.json({ message: 'Forbidden: No email associated with this account.' }, { status: 403 });
    }

    // Find patient in your mock database by email
    const patientData = db.users.find(u => u.email === userEmail && u.role === 'patient');
    
    if (!patientData) {
      return NextResponse.json({ message: 'No patient record found for this account. Please contact the clinic to have your online account linked.' }, { status: 404 });
    }
    
    // This patient has an account created via Firebase and a matching record in our mock DB.
    // The record might have been created by staff or by the user themselves via the signup flow.
    const { passwordHash, ...patientResponse } = patientData;

    return NextResponse.json(patientResponse, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching patient profile:', error);
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json({ message: 'Token expired. Please log in again.' }, { status: 401 });
    }
     if (error.code?.startsWith('auth/')) {
      return NextResponse.json({ message: 'Forbidden: Invalid authentication token.' }, { status: 403 });
    }
    // Handle case where Admin SDK might not be initialized
    if (error.message.includes("Firebase Admin SDK not initialized")) {
        return NextResponse.json({ message: "Server configuration error: Could not verify user." }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
