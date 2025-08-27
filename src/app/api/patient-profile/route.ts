
// src/app/api/patient-profile/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/mockServerDb'; // Using mock DB
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

    // Find patient in your mock database by email
    const patientData = db.users.find(u => u.email === userEmail && u.role === 'patient');
    
    if (!patientData) {
      return NextResponse.json({ message: 'No patient record found for this account. Please contact the clinic to have your online account linked.' }, { status: 404 });
    }
    
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
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
