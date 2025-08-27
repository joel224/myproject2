// src/app/api/patient-profile/treatment-plans/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { dbClient } from '@/lib/db';
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
    const userEmail = decodedToken.email;

    if (!userEmail) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    const userResult = await dbClient.query('SELECT id FROM users WHERE email = $1 AND role = $2', [userEmail, 'patient']);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: 'Patient record not found' }, { status: 404 });
    }
    const patientId = userResult.rows[0].id;

    // Fetch treatment plans from mock DB (replace with real DB query)
    // In a real app: SELECT * FROM treatment_plans WHERE patient_id = $1
    const { db: mockDb } = await import('@/lib/mockServerDb');
    const plans = mockDb.treatmentPlans.filter(plan => plan.patientId === patientId);

    return NextResponse.json(plans, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching patient treatment plans:', error);
    if (error.code?.startsWith('auth/')) {
      return NextResponse.json({ message: 'Forbidden: Invalid token' }, { status: 403 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
