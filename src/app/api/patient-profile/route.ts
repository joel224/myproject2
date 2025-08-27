
// src/app/api/patient-profile/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { getDb } from '@/lib/db';

// This is an example of keeping the Firebase Admin SDK initialization
// commented out for future use, as requested.
/*
try {
  getFirebaseAdminApp();
} catch (e: any) {
  console.warn("Firebase Admin SDK not initialized. API routes requiring it will fail. Error: ", e.message);
}
*/

export async function GET(request: NextRequest) {
  // We are now using a mock authorization via a simple token in the headers,
  // instead of the full Firebase Admin SDK verification flow.
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized: Missing or invalid token' }, { status: 401 });
  }
  
  // NOTE: This is a MOCK token verification. A real app should use a robust
  // session management library or Firebase's built-in tools.
  // The token format is assumed to be `user_id:user_role:some_random_string`
  const idToken = authHeader.split('Bearer ')[1];
  
  // In the original Firebase implementation, this would be:
  // const decodedToken = await admin.auth().verifyIdToken(idToken);
  // For now, we simulate decoding to get the email.
  // In a real scenario, you'd get the user's UID from the token and query based on that.
  // We'll assume the token contains the email for mock purposes.
  // This is NOT secure for production.
  
  // Let's assume for this mock that the idToken IS the user's email for simplicity.
  const userEmail = idToken; // This is a placeholder for the logic below.

  try {
    const db = await getDb();

    // THIS IS THE FIREBASE AUTH LOGIC -
    // IT IS COMMENTED OUT AS PER THE INSTRUCTIONS TO USE A MOCK DB.
    /*
    const admin = await import('firebase-admin');
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userEmailFromToken = decodedToken.email;

    if (!userEmailFromToken) {
      return NextResponse.json({ message: 'Forbidden: No email associated with this account.' }, { status: 403 });
    }
    */
    
    // Using the token directly as email for this mock version
    if (!userEmail) {
        return NextResponse.json({ message: 'Forbidden: No email found in token.' }, { status: 403 });
    }

    const patientData = await db.get('SELECT * FROM users WHERE email = ? AND role = ?', [userEmail, 'patient']);
    
    if (!patientData) {
      return NextResponse.json({ message: 'No patient record found for this account. Please contact the clinic to have your online account linked.' }, { status: 404 });
    }
    
    const { passwordHash, ...patientResponse } = patientData;

    return NextResponse.json(patientResponse, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching patient profile:', error);
    // This error handling remains relevant for DB connection issues or other unexpected problems.
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
