
// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { dbClient } from '@/lib/db'; // Using our new DB client
import { generateId } from '@/lib/mockServerDb'; // For mock session token

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

    // Find user by email in the database
    const userResult = await dbClient.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const user = userResult.rows[0];

    // Compare password with stored hash
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    // Simulate session creation (e.g., JWT)
    // In a real app, you'd generate a JWT, store it in an HTTP-only cookie
    const mockSessionToken = `${user.id}:${user.role}:${generateId('mockToken')}${Date.now()}`;

    // Prepare user data to return (excluding password_hash)
    const { password_hash, ...userToReturn } = user;
    
    const response = NextResponse.json({
      message: "Login successful",
      user: userToReturn,
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
     if (error instanceof Error && error.message.includes("Database client not initialized")) {
        return NextResponse.json({ message: "Server configuration error: Database not connected." }, { status: 503 });
    }
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}
