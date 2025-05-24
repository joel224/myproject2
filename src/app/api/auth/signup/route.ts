// src/app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs'; // For password hashing simulation
import { db, generateId, UserAuth } from '@/lib/mockServerDb';

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password } = validation.data;

    // Check if email already exists
    if (db.users.find(user => user.email === email)) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 }); // 409 Conflict
    }

    // Simulate password hashing
    // In a real app, use bcrypt.hash(password, saltRounds)
    const passwordHash = `$2a$10$${generateId('fakeHash')}${password.substring(0,3)}`; // Highly insecure simulation

    const newUser: UserAuth = {
      id: generateId('user_'),
      name,
      email,
      passwordHash,
      role: 'patient', // Default role for signup is patient
      // Assuming simple patient details are part of UserAuth for this mock
      // dateOfBirth and phone would be collected in a more complete profile step
    };

    db.users.push(newUser);
    
    // Also add to the 'patients' specific list if your structure requires it
    // For simplicity, we're assuming UserAuth holds enough for a basic patient here
    // If db.patients is separate and more detailed:
    // const newPatientEntry = { id: newUser.id, name, email, /* other patient fields */ };
    // db.patients.push(newPatientEntry);


    // Do NOT return the password hash
    const { passwordHash: _, ...userToReturn } = newUser;
    return NextResponse.json({ message: "User registered successfully", user: userToReturn }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}
