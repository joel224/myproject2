// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // In a real app, you might invalidate a server-side session or a JWT if it's stored in a denylist.
    // For cookie-based sessions, clearing the cookie is the primary action.
    
    const response = NextResponse.json({ message: "Logout successful" }, { status: 200 });

    // Clear the session cookie
    response.cookies.set('sessionToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: -1, // Expire immediately
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: "An unexpected error occurred during logout" }, { status: 500 });
  }
}
