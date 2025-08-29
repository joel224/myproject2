
// src/app/api/clinic/wait-time/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const waitTimeSchema = z.object({
  text: z.string().min(1, "Wait time text cannot be empty").max(50, "Wait time text too long"),
});

// The file path for the wait time JSON file
const waitTimeFilePath = path.join(process.cwd(), 'wait-time.json');
const defaultWaitTime = { text: 'Approx. 15 mins', updatedAt: new Date().toISOString() };

async function readWaitTimeFile() {
  try {
    const data = await fs.readFile(waitTimeFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    // If file doesn't exist or is invalid, return default and create it
    if (error.code === 'ENOENT') {
      await fs.writeFile(waitTimeFilePath, JSON.stringify(defaultWaitTime, null, 2), 'utf-8');
      return defaultWaitTime;
    }
    console.error("Error reading wait time file:", error);
    // Return default in case of other read errors
    return defaultWaitTime;
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

    const updatedData = {
      text: validation.data.text,
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(waitTimeFilePath, JSON.stringify(updatedData, null, 2), 'utf-8');
    
    console.log('Wait time updated in file:', updatedData);
    return NextResponse.json(updatedData, { status: 200 });

  } catch (error) {
    console.error('Error updating wait time:', error);
    return NextResponse.json({ message: 'Error updating wait time' }, { status: 500 });
  }
}
