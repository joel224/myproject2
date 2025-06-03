
// src/app/(auth)/login/page.tsx
'use client'; // This is a Client Component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';

// Firebase imports
import { auth } from '@/lib/firebase'; // Ensure this path is correct
import { signInWithEmailAndPassword } from 'firebase/auth';

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User signed in successfully:", user);

      // TODO: Fetch user role from Firestore after login
      // For now, just redirect based on some logic or to a generic dashboard
      // Example: Fetch role
      // const userDoc = await getDoc(doc(db, "users", user.uid));
      // if (userDoc.exists()) {
      //   const userData = userDoc.data();
      //   if (userData.role === 'doctor') router.push('/doctor/dashboard');
      //   else if (userData.role === 'staff') router.push('/staff/dashboard');
      //   else router.push('/patient/dashboard'); // Assuming patient dashboard
      // } else {
      //    setError("User profile not found."); // Should not happen if signup is correct
      // }
      
      toast({
        title: "Login Successful!",
        description: "Welcome back!",
      });
      
      // For now, redirect to homepage or a generic authenticated page
      router.push('/'); 

    } catch (firebaseError: any) {
      console.error("Error signing in:", firebaseError);
      if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to sign in. Please try again. ' + firebaseError.message);
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
            <Logo className="h-12 w-auto mx-auto" />
          </Link>
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Please sign in to access your portal.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
                placeholder="••••••••" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
             {error && (
              <p className="text-sm font-medium text-destructive text-center">{error}</p>
            )}
            <div className="flex items-center justify-between text-sm pt-2">
              <Link href="/forgot-password" className="font-medium text-primary hover:underline">
                Forgot your password?
              </Link>
            </div>
            <Button className="w-full mt-4" type="submit" disabled={isLoading}>
               {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col items-center space-y-2 px-6 pb-6 pt-4">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign Up as a Patient
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

