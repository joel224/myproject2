
// src/app/api/patient-profile/invoices/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
// import { getFirebaseAdminApp } from '@/lib/firebase-admin';
// import * as admin from 'firebase-admin';

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
    const userEmail = idToken; // MOCK: Using token as email

    if (!userEmail) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    const db = await getDb();
    const userResult = await db.get('SELECT id FROM users WHERE email = ? AND role = ?', [userEmail, 'patient']);

    if (!userResult) {
      return NextResponse.json({ message: 'Patient record not found' }, { status: 404 });
    }
    const patientId = userResult.id;

    // This part needs to be implemented once the invoices table is added to the DB schema
    // For now, it will return an empty array.
    const invoices = await db.all('SELECT * FROM invoices WHERE patientId = ? ORDER BY date DESC', patientId);

    return NextResponse.json(invoices, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching patient invoices:', error);
    // if (error.code?.startsWith('auth/')) {
    //   return NextResponse.json({ message: 'Forbidden: Invalid token' }, { status: 403 });
    // }
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
