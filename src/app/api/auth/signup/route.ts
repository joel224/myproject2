
// src/app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { generateId } from '@/lib/mockServerDb'; 
import type { UserAuth } from '@/lib/mockServerDb';
import { getDb } from '@/lib/db';
import * as admin from 'firebase-admin';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

// Initialize Firebase Admin
try {
    getFirebaseAdminApp();
} catch (e) {
    console.error("Firebase Admin SDK initialization error on signup route:", e);
}


const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }).optional(),
  // For social logins
  firebaseUid: z.string().optional(),
  provider: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password, firebaseUid, provider } = validation.data;
    
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);

    if (existingUser) {
      // If user exists, we assume it's a social login trying to sync, or an email that's already taken.
      // A more robust system might merge accounts, but for now, we'll just confirm they exist.
      // Or if they exist and don't have a passwordHash, we could update it.
      return NextResponse.json({ message: "User with this email already exists or is now synced.", user: existingUser }, { status: 200 });
    }

    // If it's a social signup, we don't create a new Firebase Auth user, just a DB record.
    if (firebaseUid) {
         const newSocialUser: UserAuth = {
            id: firebaseUid, // Use Firebase UID as the primary key
            name,
            email,
            role: 'patient',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
         await db.run(
            'INSERT INTO users (id, name, email, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
            newSocialUser.id, newSocialUser.name, newSocialUser.email, newSocialUser.role, newSocialUser.createdAt, newSocialUser.updatedAt
        );
        const { passwordHash: _, ...userToReturn } = newSocialUser;
        return NextResponse.json({ message: "User synced successfully", user: userToReturn }, { status: 201 });
    }


    // --- This block is for email/password signup ONLY ---
    if (!password) {
        return NextResponse.json({ message: "Password is required for email signup" }, { status: 400 });
    }

    // 1. Create user in Firebase Auth
    const firebaseUserRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: name,
    });

    // 2. Create user in our SQLite DB
    const newUser: UserAuth = {
      id: firebaseUserRecord.uid, // Use Firebase UID as the primary key
      name,
      email,
      role: 'patient', 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.run(
        'INSERT INTO users (id, name, email, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        newUser.id, newUser.name, newUser.email, newUser.role, newUser.createdAt, newUser.updatedAt
    );

    const { passwordHash: _, ...userToReturn } = newUser;

    return NextResponse.json({ message: "User registered successfully", user: userToReturn }, { status: 201 });

  } catch (error: any) {
    console.error('Signup API error:', error);
    // Handle Firebase-specific errors
    if (error.code === 'auth/email-already-exists') {
        return NextResponse.json({ message: "This email is already registered with Firebase." }, { status: 409 });
    }
    return NextResponse.json({ message: "An unexpected error occurred", details: error.message }, { status: 500 });
  }
}
