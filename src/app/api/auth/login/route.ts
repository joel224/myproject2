
// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db, generateId } from '@/lib/mockServerDb'; 

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid input", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password } = validation.data;

    const user = db.users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }
    
    // For mock purposes, we might have users without password hashes (e.g. social sign-ins)
    if (!user.passwordHash) {
        return NextResponse.json({ message: "This account uses social sign-in. Please use the appropriate login method." }, { status: 401 });
    }


    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const mockSessionToken = `${user.id}:${user.role}:${generateId('mockToken')}${Date.now()}`;
    const { passwordHash, ...userToReturn } = user;
    
    const response = NextResponse.json({
      message: "Login successful",
      user: userToReturn,
      token: mockSessionToken 
    });

    response.cookies.set('sessionToken', mockSessionToken, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, 
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}
