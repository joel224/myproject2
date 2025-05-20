import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit3, KeyRound } from "lucide-react";

export default function StaffProfilePage() {
  // Mock staff data
  const staffMember = {
    name: "Sarah ClinicStaff",
    email: "sarah.staff@dentalhub.com",
    role: "Receptionist",
    phone: "(123) 555-0123",
    joinedDate: "2022-08-15"
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>
      
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={`https://placehold.co/150x150.png?text=${staffMember.name.charAt(0)}`} alt={staffMember.name} data-ai-hint="avatar person" />
            <AvatarFallback className="text-4xl">{staffMember.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl">{staffMember.name}</CardTitle>
            <CardDescription className="text-md">{staffMember.role}</CardDescription>
            <p className="text-sm text-muted-foreground mt-1">{staffMember.email}</p>
          </div>
           {/* Staff might not be able to edit their own profile details directly depending on policy */}
          {/* <Button variant="outline"><Edit3 className="mr-2 h-4 w-4" /> Edit Profile</Button> */}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Staff Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium text-muted-foreground">Full Name:</span> {staffMember.name}</div>
              <div><span className="font-medium text-muted-foreground">Email:</span> {staffMember.email}</div>
              <div><span className="font-medium text-muted-foreground">Phone:</span> {staffMember.phone}</div>
              <div><span className="font-medium text-muted-foreground">Role:</span> {staffMember.role}</div>
              <div><span className="font-medium text-muted-foreground">Joined Date:</span> {new Date(staffMember.joinedDate).toLocaleDateString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password regularly for security.</CardDescription>
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
    </div>
  );
}
