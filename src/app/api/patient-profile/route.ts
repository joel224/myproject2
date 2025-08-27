
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

    const userId = decodedToken.uid;

    if (!userId) {
        return NextResponse.json({ message: 'Forbidden: No user ID associated with this token.' }, { status: 403 });
    }
    
    // Find the patient record linked to this user ID
    const patientData = await db.get('SELECT * FROM patients WHERE userId = ?', userId);
    
    if (!patientData) {
      return NextResponse.json({ message: 'No patient record found for this account. Please contact the clinic to have your online account linked.' }, { status: 404 });
    }
    
    // Deserialize JSON string for xrayImageUrls before sending
    if (patientData.xrayImageUrls) {
        try {
            patientData.xrayImageUrls = JSON.parse(patientData.xrayImageUrls);
        } catch (e) {
            console.error(`Invalid JSON in xrayImageUrls for patient ${patientData.id}:`, patientData.xrayImageUrls);
            patientData.xrayImageUrls = []; // Default to empty array on parse error
        }
    } else {
        patientData.xrayImageUrls = [];
    }


    return NextResponse.json(patientData, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching patient profile:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
