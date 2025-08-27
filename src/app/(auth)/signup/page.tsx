
// src/app/(auth)/signup/page.tsx

'use client'; // This is a Client Component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';

// Firebase imports
import { auth } from '@/lib/firebase'; // Ensure this path is correct for your Firebase config
import { 
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import { useToast } from "@/hooks/use-toast";

// SVG Icons for social buttons
const GoogleIcon = () => (
  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State for form inputs
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSocialLoading, setIsSocialLoading] = useState<false | 'google'>(false);


  const handleSocialSignup = async (providerName: 'google') => {
    setIsSocialLoading(providerName);
    setError(null);
    let provider;

    if (providerName === 'google') {
      provider = new GoogleAuthProvider();
    } else {
      setError("Invalid social provider.");
      setIsSocialLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      console.log(`User signed up/in with ${providerName}:`, user);

      // Call our backend API to ensure the user is in our local DB
      const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              name: user.displayName,
              email: user.email,
              firebaseUid: user.uid,
              provider: providerName,
          })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to finalize social signup.");
      }

      toast({
        title: "Account Created Successfully!",
        description: `Welcome! You're now signed in with ${providerName}.`,
      });
      router.push('/patient/dashboard'); 
    } catch (socialError: any) {
      console.error(`Error signing up/in with ${providerName}:`, socialError);
      if (socialError.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with this email using a different sign-in method. Try logging in.');
      } else if (socialError.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup closed before completion.');
      } else {
        setError(`Failed to sign up with ${providerName}. Please try again. ` + socialError.message);
      }
    } finally {
      setIsSocialLoading(false);
    }
  };


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              name: fullName,
              email: email,
              password: password
          })
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create account.");
      }

      toast({
        title: "Account Created!",
        description: "You can now log in.",
      });
      router.push('/login');

    } catch (err: any) {
      console.error("Error signing up:", err);
      setError(err.message || 'An unexpected error occurred.');
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
                disabled={!!isSocialLoading}
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
                disabled={!!isSocialLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min. 6 characters)"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!!isSocialLoading}
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
                disabled={!!isSocialLoading}
              />
            </div>
            
            <Button className="w-full mt-2" type="submit" disabled={isLoading || !!isSocialLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account with Email'}
            </Button>
          </CardContent>
        </form>

        <div className="px-6 pb-2">
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="space-y-3 mt-3">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handleSocialSignup('google')}
                disabled={!!isSocialLoading || isLoading}
              >
                {isSocialLoading === 'google' ? 'Signing up with Google...' : <><GoogleIcon /> Sign up with Google</>}
              </Button>
            </div>
        </div>
         {error && (
          <p className="text-sm font-medium text-destructive text-center px-6 py-3">{error}</p>
        )}

        <CardFooter className="flex justify-center pt-6 pb-6">
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
