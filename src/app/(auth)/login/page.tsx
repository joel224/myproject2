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
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-sm text-muted-foreground">
            Forgot your password?{" "}
            <Link href="/forgot-password" className="font-medium text-primary hover:underline">
              Reset it here
            </Link>
          </p>
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue as
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 w-full">
             <Link href="/patient/dashboard" passHref> {/* Placeholder, should be /patient/login ideally */}
              <Button variant="outline" className="w-full">Patient Portal</Button>
            </Link>
            <Link href="/doctor/dashboard" passHref> {/* Placeholder, should be /doctor/login ideally */}
              <Button variant="outline" className="w-full">Doctor Portal</Button>
            </Link>
            <Link href="/staff/dashboard" passHref> {/* Placeholder, should be /staff/login ideally */}
              <Button variant="outline" className="w-full">Staff Portal</Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
