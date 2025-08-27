
// src/app/api/patient-profile/appointments/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { authorize } from '@/lib/mockServerDb';

export async function GET(request: NextRequest) {
  const authResult = await authorize(request, 'patient');
  if (!authResult.authorized || !authResult.user) {
    return authResult.error || NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = authResult.user.id;

  try {
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
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
