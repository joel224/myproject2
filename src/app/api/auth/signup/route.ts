
// src/app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db'; 
import { generateId } from '@/lib/mockServerDb';
import bcrypt from 'bcryptjs';
// import * as admin from 'firebase-admin';
// import { getFirebaseAdminApp } from '@/lib/firebase-admin';

// // Initialize Firebase Admin
// try {
//     getFirebaseAdminApp();
// } catch (e) {
//     console.error("Firebase Admin SDK initialization error on signup route:", e);
// }


const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  // For social logins
  // firebaseUid: z.string().optional(),
  // provider: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password } = validation.data;
    
    // Check if a user with this email already exists in our DB
    const existingUserInDb = await db.get('SELECT * FROM users WHERE email = ?', email);

    if (existingUserInDb) {
      return NextResponse.json({ message: "An account with this email address already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUserId = generateId('user_');
    const now = new Date().toISOString();

    // Create the user record in our local DB
    await db.run(
        'INSERT INTO users (id, name, email, role, passwordHash, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        createdUserId, name, email, 'patient', hashedPassword, now, now
    );
    
    // Create the corresponding clinical patient record
    const newPatientId = generateId('pat_');
    await db.run(
        'INSERT INTO patients (id, userId, name, email, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        newPatientId, createdUserId, name, email, now, now
    );
    
    return NextResponse.json({ message: "User account created successfully." }, { status: 201 });


  } catch (error: any) {
    console.error('Signup API error:', error);
    // if (error.code === 'auth/email-already-exists' || error.code === 'auth/email-already-in-use') {
    //     return NextResponse.json({ message: "An account with this email address already exists in our system. Please try logging in or resetting your password." }, { status: 409 });
    // }
    return NextResponse.json({ message: "An unexpected server error occurred.", details: error.message }, { status: 500 });
  }
}
