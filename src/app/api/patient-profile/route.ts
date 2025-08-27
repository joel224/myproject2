// src/app/api/patient-profile/route.ts
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
