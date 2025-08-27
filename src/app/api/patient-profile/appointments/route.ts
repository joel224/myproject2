
// src/app/api/patient-profile/appointments/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
// import { getFirebaseAdminApp } from '@/lib/firebase-admin';
// import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// getFirebaseAdminApp(); // Commented out as per instructions

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const idToken = authHeader.split('Bearer ')[1];

  try {
    // --- Firebase Admin SDK logic commented out ---
    // const decodedToken = await admin.auth().verifyIdToken(idToken);
    // const userEmail = decodedToken.email;
    
    // Mock logic: Assume token is the user's email for this example.
    // This is NOT secure and for demonstration purposes only.
    const userEmail = idToken;

    if (!userEmail) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const db = await getDb();
    
    const userResult = await db.get('SELECT id FROM users WHERE email = ? AND role = ?', [userEmail, 'patient']);

    if (!userResult) {
      return NextResponse.json({ message: 'Patient record not found' }, { status: 404 });
    }
    const patientId = userResult.id;
    
    const appointments = await db.all('SELECT * FROM appointments WHERE patientId = ? ORDER BY date DESC, time ASC', patientId);

    return NextResponse.json(appointments, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching patient appointments:', error);
    // if (error.code?.startsWith('auth/')) {
    //   return NextResponse.json({ message: 'Forbidden: Invalid token' }, { status: 403 });
    // }
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
