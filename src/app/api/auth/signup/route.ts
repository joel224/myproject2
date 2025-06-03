
// src/app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { dbClient } from '@/lib/db'; // Using our new DB client
import { generateId } from '@/lib/mockServerDb'; // Still useful for mock session tokens, etc.

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  // Optional fields can be added to schema for initial patient profile creation
  phone: z.string().optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of Birth must be YYYY-MM-DD").optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password, phone, dateOfBirth } = validation.data;

    // Check if email already exists
    const existingUserResult = await dbClient.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUserResult.rows.length > 0) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 }); // 409 Conflict
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const role = 'patient'; // Default role for signup

    // Insert new user into the database
    // Note: Using RETURNING * to get the newly created user's data, including the generated ID.
    const newUserInsertResult = await dbClient.query(
      `INSERT INTO users (name, email, password_hash, role, phone, date_of_birth)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, phone, date_of_birth, created_at`,
      [name, email, passwordHash, role, phone, dateOfBirth]
    );

    if (newUserInsertResult.rows.length === 0) {
      return NextResponse.json({ message: "Failed to create user" }, { status: 500 });
    }

    const newUser = newUserInsertResult.rows[0];

    // In a real app, you might also add more detailed patient info to a separate 'patients' table
    // if your UserAuth model is kept lean. For now, UserAuth fields in the users table will suffice.

    return NextResponse.json({ message: "User registered successfully", user: newUser }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof Error && error.message.includes("Database client not initialized")) {
        return NextResponse.json({ message: "Server configuration error: Database not connected." }, { status: 503 });
    }
    // Check for specific database errors, e.g., unique constraint violation (though we check email first)
    if (error instanceof Error && 'code' in error && (error as any).code === '23505') { // PostgreSQL unique violation
      return NextResponse.json({ message: "An account with this email may already exist." }, { status: 409 });
    }
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}
