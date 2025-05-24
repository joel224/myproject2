// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs'; // For password hashing simulation
import { db, UserAuth } from '@/lib/mockServerDb';

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

    // Simulate password comparison
    // In a real app: const isValid = await bcrypt.compare(password, user.passwordHash);
    // For this mock, we'll do a very simple check (highly insecure)
    const simulatedHashCheck = user.passwordHash.includes(password.substring(0,3)); 
    // This is NOT how bcrypt.compare works; it's just a mock.
    // Real bcrypt.compare would be something like:
    // const isValidPassword = await bcrypt.compare(password, user.passwordHash);


    if (!simulatedHashCheck) { // Replace with !isValidPassword in real app
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    // Simulate session creation (e.g., JWT)
    // In a real app, you'd generate a JWT, store it in an HTTP-only cookie
    const mockSessionToken = `${user.id}:${user.role}:mockToken${Date.now()}`; // Example token
    
    const response = NextResponse.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: mockSessionToken // For client-side storage if not using cookies primarily
    });

    // Set a cookie (example)
    response.cookies.set('sessionToken', mockSessionToken, {
      httpOnly: true, // Important for security
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}
