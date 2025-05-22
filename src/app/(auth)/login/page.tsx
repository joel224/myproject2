
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";

export default function LoginPage() {
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full" type="submit">
            Sign In
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4 px-6 pb-6 pt-4">
          
          <p className="text-sm text-muted-foreground">
            Forgot your password?{" "}
            <Link href="/forgot-password" className="font-medium text-primary hover:underline">
              Reset it here
            </Link>
          </p>

          <div className="relative w-full flex items-center justify-center py-3">
            <div className="absolute inset-x-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border" />
            </div>
            <span className="relative bg-card px-3 text-xs uppercase text-muted-foreground">
              Or Continue As
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-3 w-full">
            <Link href="/login?for=patient" legacyBehavior passHref>
              <Button variant="outline" className="w-full">Patient Portal</Button>
            </Link>
            <Link href="/login?for=doctor" legacyBehavior passHref>
              <Button variant="outline" className="w-full">Doctor Portal</Button>
            </Link>
            <Link href="/login?for=staff" legacyBehavior passHref>
              <Button variant="outline" className="w-full">Staff Portal</Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground pt-2">
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
