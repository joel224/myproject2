
// src/app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db'; 
import { generateId } from '@/lib/mockServerDb';
import bcrypt from 'bcryptjs';

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
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
    const now = new Date().toISOString();

    const existingUser = await db.get('SELECT id, passwordHash FROM users WHERE email = ?', email);

    if (existingUser) {
      if (existingUser.passwordHash) {
        return NextResponse.json({ message: "An account with this email address already exists. Please log in." }, { status: 409 });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run(
          'UPDATE users SET name = ?, passwordHash = ?, updatedAt = ? WHERE id = ?',
          name, hashedPassword, now, existingUser.id
        );
        
        // Also update the name in the corresponding patients table if it exists.
        // This is important for consistency if the user was created by staff with a placeholder name.
        await db.run('UPDATE patients SET name = ? WHERE userId = ?', name, existingUser.id);
        
        return NextResponse.json({ message: "Account activated! Your password has been set. You can now log in." }, { status: 200 });
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUserId = generateId('user_');

      // Create the user record
      await db.run(
          'INSERT INTO users (id, name, email, role, passwordHash, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
          newUserId, name, email, 'patient', hashedPassword, now, now
      );
      
      // Also create the corresponding patient clinical record
      const newPatientId = generateId('pat_');
      await db.run(
          'INSERT INTO patients (id, userId, name, email, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
          newPatientId, newUserId, name, email, now, now
      );
      
      return NextResponse.json({ message: "User account and patient record created successfully." }, { status: 201 });
    }

  } catch (error: any) {
    console.error('Signup API error:', error);
    return NextResponse.json({ message: "An unexpected server error occurred.", details: error.message }, { status: 500 });
  }
}
