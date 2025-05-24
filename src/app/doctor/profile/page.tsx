import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Edit3, KeyRound, ShieldCheck } from "lucide-react";

export default function DoctorProfilePage() {
  // Mock doctor data - in a real app, this would come from auth/API
  const doctor = {
    name: "Dr. Loji",
    email: "dr.loji@dentalhub.com",
    specialty: "General & Cosmetic Dentistry",
    phone: "(123) 456-7890",
    bio: "With over 15 years of experience, Dr. Loji is dedicated to providing top-quality dental care with a compassionate approach. Passionate about creating beautiful, healthy smiles that last a lifetime."
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
      
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={`https://placehold.co/150x150.png?text=${doctor.name.charAt(0)}`} alt={doctor.name} data-ai-hint="avatar person" />
            <AvatarFallback className="text-4xl">{doctor.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl">{doctor.name}</CardTitle>
            <CardDescription className="text-md">{doctor.specialty}</CardDescription>
            <p className="text-sm text-muted-foreground mt-1">{doctor.email}</p>
          </div>
          <Button variant="outline"><Edit3 className="mr-2 h-4 w-4" /> Edit Profile</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium text-muted-foreground">Full Name:</span> {doctor.name}</div>
              <div><span className="font-medium text-muted-foreground">Email:</span> {doctor.email}</div>
              <div><span className="font-medium text-muted-foreground">Phone:</span> {doctor.phone}</div>
              <div><span className="font-medium text-muted-foreground">Specialty:</span> {doctor.specialty}</div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Bio</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{doctor.bio}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences and security.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
        </CardContent>
        <CardFooter>
          <Button><KeyRound className="mr-2 h-4 w-4" /> Update Password</Button>
        </CardFooter>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Enhance your account security.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between p-3 border rounded-md">
                <div>
                    <h4 className="font-medium">Two-Factor Authentication (2FA)</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                </div>
                <Button variant="outline"><ShieldCheck className="mr-2 h-4 w-4"/> Enable 2FA</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
