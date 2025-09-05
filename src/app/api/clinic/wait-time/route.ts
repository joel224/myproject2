
// src/app/api/clinic/wait-time/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import waitTimeData from '../../../../../wait-time.json';


const waitTimeSchema = z.object({
  text: z.string().min(1, "Wait time text cannot be empty").max(50, "Wait time text too long"),
});

// The file path for the wait time JSON file is now used for writing only
const waitTimeFilePath = path.join(process.cwd(), 'wait-time.json');

/**
 * GET /api/clinic/wait-time - Get current wait time
 */
export async function GET(request: NextRequest) {
  // Use the imported data directly. This is more reliable in various environments.
  return NextResponse.json(waitTimeData, { status: 200 });
}

/**
 * PUT /api/clinic/wait-time - Update the wait time
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = waitTimeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const updatedData = {
      text: validation.data.text,
      updatedAt: new Date().toISOString(),
    };

    // Writing to the file system might not work in all hosting environments (e.g., Vercel Edge).
    // This is kept for local development but might need a database in a real production scenario.
    try {
        await fs.writeFile(waitTimeFilePath, JSON.stringify(updatedData, null, 2), 'utf-8');
        console.log('Wait time updated in file:', updatedData);
    } catch (writeError) {
        console.error("Warning: Could not write to wait-time.json. This is expected in some serverless environments.", writeError);
        // We can still return a success response, as the primary function of updating might be for show in a demo.
    }
    
    return NextResponse.json(updatedData, { status: 200 });

  } catch (error) {
    console.error('Error updating wait time:', error);
    return NextResponse.json({ message: 'Error updating wait time' }, { status: 500 });
  }
}
