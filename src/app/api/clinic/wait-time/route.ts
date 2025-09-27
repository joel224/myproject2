
// src/app/api/clinic/wait-time/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

// Define the structure of our wait time data
interface WaitTimeData {
  text: string;
  updatedAt: string;
}

const waitTimeSchema = z.object({
  text: z.string().min(1, "Wait time text cannot be empty").max(50, "Wait time text too long"),
});

// The file path for the wait time JSON file
const waitTimeFilePath = path.join(process.cwd(), 'wait-time.json');

// Helper function to read the wait time file
async function readWaitTimeFile(): Promise<WaitTimeData> {
    try {
        const data = await fs.readFile(waitTimeFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If the file doesn't exist or is invalid, return a default
        console.error("Could not read wait-time.json, returning default. Error:", error);
        return { text: 'N/A', updatedAt: new Date().toISOString() };
    }
}


/**
 * GET /api/clinic/wait-time - Get current wait time
 */
export async function GET(request: NextRequest) {
  const waitTimeData = await readWaitTimeFile();
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

    const updatedData: WaitTimeData = {
      text: validation.data.text,
      updatedAt: new Date().toISOString(),
    };
    
    // Writing to the file system might not work in all hosting environments (e.g., Vercel Edge).
    // This is kept for local development but might need a database in a real production scenario.
    try {
        await fs.writeFile(waitTimeFilePath, JSON.stringify(updatedData, null, 2), 'utf-8');
    } catch (writeError) {
        console.error("Warning: Could not write to wait-time.json. This is expected in some serverless environments.", writeError);
    }
    
    return NextResponse.json(updatedData, { status: 200 });

  } catch (error) {
    console.error('Error updating wait time:', error);
    return NextResponse.json({ message: 'Error updating wait time' }, { status: 500 });
  }
}
