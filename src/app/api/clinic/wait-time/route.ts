// src/app/api/clinic/wait-time/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db, authorize } from '@/lib/mockServerDb';

const waitTimeSchema = z.object({
  text: z.string().min(1, "Wait time text cannot be empty").max(50, "Wait time text too long"),
});

/**
 * GET /api/clinic/wait-time - Get current wait time
 */
export async function GET(request: NextRequest) {
  // This is a public endpoint, no auth needed for GET
  return NextResponse.json(db.clinicWaitTime, { status: 200 });
}

/**
 * PUT /api/clinic/wait-time - Update the wait time
 */
export async function PUT(request: NextRequest) {
  // For a real deployment, uncomment and ensure authorize function works with your auth system.
  // const authResult = await authorize(request, 'staff');
  // if (!authResult.authorized || !authResult.user) {
  //   return authResult.error;
  // }
  // console.log(`User ${authResult.user.email} updating wait time.`);

  try {
    const body = await request.json();
    const validation = waitTimeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    db.clinicWaitTime.text = validation.data.text;
    db.clinicWaitTime.updatedAt = new Date().toISOString();

    console.log('Wait time updated in mock DB:', db.clinicWaitTime);
    return NextResponse.json(db.clinicWaitTime, { status: 200 });

  } catch (error) {
    console.error('Error updating wait time:', error);
    return NextResponse.json({ message: 'Error updating wait time' }, { status: 500 });
  }
}
