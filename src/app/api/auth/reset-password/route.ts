// src/app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db, generateId } from '@/lib/mockServerDb';

const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Token is required" }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters long" }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { token, newPassword } = validation.data;

    const user = db.users.find(u => u.resetToken === token && u.resetTokenExpiry && u.resetTokenExpiry > new Date());

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired reset token" }, { status: 400 });
    }

    // Simulate password hashing
    user.passwordHash = `$2a$10$${generateId('newHash')}${newPassword.substring(0,3)}`; // Highly insecure simulation
    
    // Invalidate the token
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    return NextResponse.json({ message: "Password has been reset successfully" }, { status: 200 });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}
