
// src/app/api/staff/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db, generateId, authorize } from '@/lib/mockServerDb';
import type { UserAuth } from '@/lib/mockServerDb';
import type { StaffMember } from '@/lib/types';

const staffRoleEnum = z.enum(['Dentist', 'Hygienist', 'Assistant', 'Receptionist', 'Admin']);

const createStaffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  role: staffRoleEnum,
});

// Helper to map UserAuth role to StaffMember role for API response consistency
function mapUserAuthRoleToStaffMemberRole(userAuthRole: UserAuth['role']): StaffMember['role'] | null {
  switch (userAuthRole) {
    case 'doctor': return 'Dentist';
    case 'hygienist': return 'Hygienist';
    case 'assistant': return 'Assistant';
    case 'staff': return 'Receptionist'; // Assuming 'staff' in UserAuth is 'Receptionist' for StaffMember
    case 'admin': return 'Admin';
    default: return null; // 'patient' or other roles not relevant here
  }
}

export async function POST(request: NextRequest) {
  // const authResult = await authorize(request, 'admin');
  // if (!authResult.authorized || !authResult.user) {
  //   return authResult.error;
  // }

  try {
    const body = await request.json();
    const validation = createStaffSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, role: staffMemberRole } = validation.data;

    const emailSuffix = "@dentalhub.com";
    const simpleName = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/gi, '');
    const email = `${simpleName}${db.users.filter(u => u.role !== 'patient').length + 1}${emailSuffix}`;

    if (db.users.some(u => u.email === email)) {
        return NextResponse.json({ message: "Generated email already exists, try a slightly different name." }, { status: 409 });
    }

    const newStaffUserId = generateId('staff_');
    
    let userAuthRole: UserAuth['role'] = 'staff'; // default
    if (staffMemberRole === 'Dentist') userAuthRole = 'doctor';
    else if (staffMemberRole === 'Hygienist') userAuthRole = 'hygienist';
    else if (staffMemberRole === 'Assistant') userAuthRole = 'assistant';
    else if (staffMemberRole === 'Receptionist') userAuthRole = 'staff';
    else if (staffMemberRole === 'Admin') userAuthRole = 'admin';

    const newUser: UserAuth = {
      id: newStaffUserId,
      name,
      email,
      passwordHash: `$2a$10$mockStaffPassword${generateId()}`,
      role: userAuthRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.push(newUser);

    // Return data in the StaffMember format
    const newStaffMemberResponse: StaffMember = {
        id: newStaffUserId,
        name,
        email,
        role: staffMemberRole, // Use the role provided in the request for the response
    };

    return NextResponse.json(newStaffMemberResponse, { status: 201 });

  } catch (error) {
    console.error('Error creating staff member:', error);
    return NextResponse.json({ message: 'Error creating staff member. Please check logs.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // const authResult = await authorize(request, ['admin', 'staff', 'doctor']); 
  // if (!authResult.authorized || !authResult.user) { return authResult.error; }

  const { searchParams } = new URL(request.url);
  const roleQuery = searchParams.get('role') as StaffMember['role'] | null;
  const allUsersQuery = searchParams.get('allUsers');

  // If ?allUsers=true is passed, return all users regardless of role (for suggestions)
  if (allUsersQuery === 'true') {
    return NextResponse.json(db.users, { status: 200 });
  }


  const staffUsers = db.users.filter(user => {
    const staffMemberRole = mapUserAuthRoleToStaffMemberRole(user.role);
    if (!staffMemberRole) return false; // Not a staff role
    if (roleQuery) {
      return staffMemberRole.toLowerCase() === roleQuery.toLowerCase();
    }
    return true; // Include all staff/doctor roles if no specific role is queried
  });

  let staffList: StaffMember[] = staffUsers.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: mapUserAuthRoleToStaffMemberRole(user.role) as StaffMember['role'], // Type assertion after filtering nulls
  }));
  
  staffList.sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(staffList, { status: 200 });
}
