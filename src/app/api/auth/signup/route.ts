
// src/app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db, generateId, type UserAuth } from '@/lib/mockServerDb'; 

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
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

    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const role = 'patient'; 
    const newUser: UserAuth = {
      id: generateId('user_'),
      name,
      email,
      passwordHash,
      role,
      phone,
      dateOfBirth,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    const { passwordHash: _, ...userToReturn } = newUser;

    return NextResponse.json({ message: "User registered successfully", user: userToReturn }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}
