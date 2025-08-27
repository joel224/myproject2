
// src/app/api/patient-profile/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { getDb } from '@/lib/db';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
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
    const db = await getDb();
    let decodedToken;
    try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (authError: any) {
        console.error("Firebase Auth Token verification error:", authError);
        return NextResponse.json({ message: 'Forbidden: Invalid or expired token' }, { status: 403 });
    }

    const userEmail = decodedToken.email;

    if (!userEmail) {
        return NextResponse.json({ message: 'Forbidden: No email associated with this token.' }, { status: 403 });
    }

    const patientData = await db.get('SELECT * FROM users WHERE email = ? AND role = ?', [userEmail, 'patient']);
    
    if (!patientData) {
      return NextResponse.json({ message: 'No patient record found for this account. Please contact the clinic to have your online account linked.' }, { status: 404 });
    }
    
    const { passwordHash, ...patientResponse } = patientData;

    return NextResponse.json(patientResponse, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching patient profile:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
