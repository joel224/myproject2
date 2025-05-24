// src/app/api/auth/request-password-reset/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db, generateId } from '@/lib/mockServerDb';

const requestResetSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = requestResetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }

    const { email } = validation.data;
    const user = db.users.find(u => u.email === email);

    if (user) {
      // Generate a mock reset token and expiry
      user.resetToken = generateId('reset_');
      user.resetTokenExpiry = new Date(Date.now() + 3600000); // Expires in 1 hour

      // Simulate sending an email
      console.log(`Password reset requested for ${email}.`);
      console.log(`Mock Reset Link: /reset-password?token=${user.resetToken}`);
      // In a real app, use a service like Nodemailer, SendGrid, etc. to send an actual email.
    } else {
      // Even if user not found, return a generic success message to prevent email enumeration
      console.log(`Password reset requested for non-existent email: ${email}. Responding generically.`);
    }
    
    // Always return a generic success message to prevent attackers from discovering valid emails.
    return NextResponse.json({ message: "If an account with this email exists, a password reset link has been sent." }, { status: 200 });

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}
