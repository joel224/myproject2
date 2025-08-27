
// src/app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { generateId } from '@/lib/mockServerDb'; 
import type { UserAuth } from '@/lib/mockServerDb';
import { getDb } from '@/lib/db';

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  phone: z.string().optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of Birth must be YYYY-MM-DD").optional(),
});

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password, phone, dateOfBirth } = validation.data;
    
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);

    if (existingUser) {
      if (!existingUser.passwordHash) {
         const saltRounds = 10;
         const passwordHash = await bcrypt.hash(password, saltRounds);
         await db.run(
           'UPDATE users SET passwordHash = ?, name = ?, updatedAt = ? WHERE id = ?',
           passwordHash, name, new Date().toISOString(), existingUser.id
         );
         
         const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', existingUser.id);
         const { passwordHash: _, ...userToReturn } = updatedUser;
         return NextResponse.json({ message: "Account activated successfully", user: userToReturn }, { status: 200 });
      } else {
        return NextResponse.json({ message: "User with this email already exists" }, { status: 409 });
      }
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser: UserAuth = {
      id: generateId('user_'),
      name,
      email,
      passwordHash,
      role: 'patient', 
      phone,
      dateOfBirth,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.run(
        'INSERT INTO users (id, name, email, passwordHash, role, phone, dateOfBirth, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        newUser.id, newUser.name, newUser.email, newUser.passwordHash, newUser.role, newUser.phone, newUser.dateOfBirth, newUser.createdAt, newUser.updatedAt
    );

    const { passwordHash: _, ...userToReturn } = newUser;

    return NextResponse.json({ message: "User registered successfully", user: userToReturn }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}
