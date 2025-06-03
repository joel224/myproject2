
// src/app/(auth)/signup/page.tsx

'use client'; // This is a Client Component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';

// Firebase imports
import { auth, db } from '@/lib/firebase'; // Ensure this path is correct for your Firebase config
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// UI Components (Shadcn UI)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";

export default function SignupPage() {
  const router = useRouter();

  // State for form inputs
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null); // State for displaying errors
  const [isLoading, setIsLoading] = useState<boolean>(false); // State for loading button

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    setIsLoading(true); // Start loading
    setError(null); // Clear previous errors

    // --- Basic Client-Side Validation ---
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) { // Firebase minimum password length is 6 characters
        setError("Password must be at least 6 characters long.");
        setIsLoading(false);
        return;
    }

    try {
      // 1. Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("User created successfully with Firebase Auth:", user);

      // 2. Save additional user data to Firestore
      // Use user.uid as the document ID to link Firestore profile to Auth user
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid, // Store UID explicitly
        email: user.email,
        fullName: fullName, // Save the full name from the form
        role: 'patient', // Default role as per your database schema
        createdAt: new Date(), // Use a Date object for Firestore timestamp
        // You can add more fields here if you collect them in the form
        // dateOfBirth: null, // Example for date_of_birth
        // phone: null, // Example for phone
      });

      console.log("User profile saved to Firestore for UID:", user.uid);

      // Redirect the user to the login page after successful signup
      router.push('/login?signupSuccess=true');

    } catch (firebaseError: any) {
      console.error("Error signing up:", firebaseError);
      // Handle specific Firebase Authentication errors
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('The email address is already in use.');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('The password is too weak. Please choose a stronger one.');
      } else {
        // Fallback for any other unexpected errors
        setError('Failed to create account. Please try again. ' + firebaseError.message);
      }
    } finally {
      setIsLoading(false); // Always stop loading, whether success or error
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
            <Logo className="h-12 w-auto mx-auto" />
          </Link>
          <CardTitle className="text-2xl">Create Patient Account</CardTitle>
          <CardDescription>Sign up to access your patient portal.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your Full Name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {/* Display error message if any */}
            {error && (
              <p className="text-sm font-medium text-destructive text-center">{error}</p>
            )}
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex justify-center pt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
