
// src/app/api/patient-profile/invoices/route.ts
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
    const patientResult = await db.get('SELECT id FROM patients WHERE userId = ?', userId);

    if (!patientResult) {
       return NextResponse.json([], { status: 200 });
    }
    const patientId = patientResult.id;

    // This part needs to be implemented once the invoices table is added to the DB schema
    // For now, it will return an empty array.
    const tableExists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='invoices'");
    if (!tableExists) {
        return NextResponse.json([], { status: 200 });
    }

    const invoices = await db.all('SELECT * FROM invoices WHERE patientId = ? ORDER BY date DESC', patientId);

    return NextResponse.json(invoices, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching patient invoices:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
