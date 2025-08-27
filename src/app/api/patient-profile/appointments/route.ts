
// src/app/api/patient-profile/appointments/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
getFirebaseAdminApp();

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    
    if (!userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const db = await getDb();
    
    // First, find the patient's clinical ID (from the patients table) using their user ID
    const patientResult = await db.get('SELECT id FROM patients WHERE userId = ?', userId);

    if (!patientResult) {
      // This user has a valid login but no associated clinical patient record.
      return NextResponse.json([], { status: 200 }); // Return empty array, not an error
    }
    const patientId = patientResult.id;
    
    const appointments = await db.all('SELECT * FROM appointments WHERE patientId = ? ORDER BY date DESC, time ASC', patientId);

    return NextResponse.json(appointments, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching patient appointments:', error);
    if (error.code?.startsWith('auth/')) {
      return NextResponse.json({ message: 'Forbidden: Invalid token' }, { status: 403 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
