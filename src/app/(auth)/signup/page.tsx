
// src/app/(auth)/signup/page.tsx

'use client'; // This is a Client Component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';

// Firebase imports
import { auth, db } from '@/lib/firebase'; // Ensure this path is correct for your Firebase config
import { 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider, // For Apple
  signInWithPopup,
  updateProfile, // To set displayName for email/password users
  type User
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import { useToast } from "@/hooks/use-toast";

// SVG Icons for social buttons (can be imported or defined here if small)
const GoogleIcon = () => (
  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

const AppleIcon = () => (
  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.57 15.98c-.13.04-.28.07-.46.07-.62 0-1.11-.23-1.47-.69-.39-.5-.59-1.17-.59-2.02 0-1.69.89-2.91 2.17-3.45-.21-.32-.48-.62-.79-.88-.93-.75-1.78-1.12-2.8-1.12-1.28 0-2.31.51-3.08 1.53-.8.98-1.21 2.34-1.21 4.08 0 1.2.23 2.22.68 3.08.47.88 1.12 1.32 1.94 1.32.55 0 1.1-.18 1.64-.53.54-.35.93-.53 1.17-.53s.4.15.65.45c.24.3.36.68.36 1.13 0 .63-.21 1.22-.62 1.78-.41.56-.88.83-1.43.83-.46 0-.89-.15-1.29-.44-.39-.28-.8-.42-1.23-.42-.95 0-1.7.39-2.25 1.15-.57.79-.85 1.8-.85 3.05 0 .31.03.6.08.88.43.12.89.18 1.38.18 1.01 0 1.93-.37 2.75-1.12.82-.75 1.24-1.71 1.24-2.88 0-.12-.01-.24-.04-.37-.06-.22-.1-.39-.1-.51s.07-.22.22-.31c.15-.09.33-.14.55-.14.87 0 1.54.33 2.01.98.47.65.71 1.41.71 2.3 0 .2-.01.4-.04.59-.03.19-.04.34-.04.46 0 .55.14.99.42 1.32.28.33.63.5 1.04.5.43 0 .82-.14 1.15-.41.33-.27.5-.63.5-1.08 0-.63-.26-1.28-.78-1.96-.3-.4-.44-.75-.44-1.07zM15.5 2.84c.8-.94 1.2-2.08 1.2-3.43 0-.24-.03-.47-.08-.68-.7.03-1.41.27-2.12.72-.75.48-1.28 1.03-1.59 1.65-.04.06-.07.13-.09.22-.06.22-.09.43-.09.61 0 1.32.49 2.35 1.48 3.08.1.07.2.11.3.11.19 0 .36-.07.5-.21z" transform="translate(0 -0.59)"/>
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
  const [isSocialLoading, setIsSocialLoading] = useState<false | 'google' | 'apple'>(false);

   // Helper to save/update user data in Firestore
  const saveUserToFirestore = async (user: User, name?: string) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // For social sign-ins, user.displayName might be available. For email, we pass `name`.
    const finalName = name || user.displayName || 'New User';

    if (!userSnap.exists()) { // Only create if user doesn't exist
      const userData = {
        uid: user.uid,
        email: user.email,
        fullName: finalName,
        role: 'patient', // Default role for all sign-ups
        createdAt: serverTimestamp(),
        provider: user.providerData?.[0]?.providerId || 'password', // 'password' for email/pass
      };
      await setDoc(userRef, userData);
      console.log("New user profile saved to Firestore:", user.uid);
    } else {
      // User might exist if they, for example, signed up with email and then tried social with same email.
      // Firebase handles linking these if the email is verified. We can merge data.
      console.log("User already exists in Firestore, merging data:", user.uid);
      await setDoc(userRef, {
        fullName: finalName, // Update name if provided
        provider: user.providerData?.[0]?.providerId || userSnap.data()?.provider, // Update provider
      }, { merge: true });
    }
  };

  const handleSocialSignup = async (providerName: 'google' | 'apple') => {
    setIsSocialLoading(providerName);
    setError(null);
    let provider;

    if (providerName === 'google') {
      provider = new GoogleAuthProvider();
    } else if (providerName === 'apple') {
      provider = new OAuthProvider('apple.com');
    } else {
      setError("Invalid social provider.");
      setIsSocialLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      console.log(`User signed up/in with ${providerName}:`, user);

      await saveUserToFirestore(user); // Name will be taken from user.displayName

      toast({
        title: "Account Created Successfully!",
        description: `Welcome! You're now signed in with ${providerName}.`,
      });
      router.push('/'); // Redirect to homepage or dashboard
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User created with Firebase Auth:", user);

      // Update Firebase Auth profile with fullName
      if (user) {
        await updateProfile(user, { displayName: fullName });
      }

      await saveUserToFirestore(user, fullName);

      toast({
        title: "Account Created!",
        description: "You can now log in.",
      });
      router.push('/login');

    } catch (firebaseError: any) {
      console.error("Error signing up with email/password:", firebaseError);
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('The email address is already in use.');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('The password is too weak. Please choose a stronger one.');
      } else {
        setError('Failed to create account. ' + firebaseError.message);
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
              {isLoading ? 'Creating Account...' : 'Create Account'}
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
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handleSocialSignup('apple')}
                disabled={!!isSocialLoading || isLoading}
              >
                {isSocialLoading === 'apple' ? 'Signing up with Apple...' : <><AppleIcon /> Sign up with Apple</>}
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

