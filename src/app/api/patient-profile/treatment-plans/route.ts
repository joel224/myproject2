
// src/app/api/patient-profile/treatment-plans/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

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
    const patientResult = await db.get('SELECT id FROM patients WHERE userId = ?', userId);

    if (!patientResult) {
      return NextResponse.json([], { status: 200 });
    }
    const patientId = patientResult.id;
    
    // This part needs to be implemented once the treatment_plans table is added to the DB schema
    const tableExists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='treatment_plans'");
    if (!tableExists) {
        return NextResponse.json([], { status: 200 });
    }

    const plans = await db.all('SELECT * FROM treatment_plans WHERE patientId = ?', patientId);

    return NextResponse.json(plans, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching patient treatment plans:', error);
    if (error.code?.startsWith('auth/')) {
      return NextResponse.json({ message: 'Forbidden: Invalid token' }, { status: 403 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
