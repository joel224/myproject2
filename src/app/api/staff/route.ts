
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
  // Email will be auto-generated for mock purposes
});

export async function POST(request: NextRequest) {
  // TODO: Add authorization check:
  // const authResult = await authorize(request, 'admin'); // Only admins or senior staff should add new staff
  // if (!authResult.authorized || !authResult.user) {
  //   return authResult.error;
  // }

  try {
    const body = await request.json();
    const validation = createStaffSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, role } = validation.data;

    // Generate a mock email based on the name
    const emailSuffix = "@dentalhub.com";
    const simpleName = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/gi, '');
    const email = `${simpleName}${db.users.filter(u => u.role !== 'patient').length + 1}${emailSuffix}`;

    // Check if email already exists (highly unlikely for mock but good practice)
    if (db.users.some(u => u.email === email)) {
        return NextResponse.json({ message: "Generated email already exists, try a slightly different name." }, { status: 409 });
    }

    const newStaffUserId = generateId('staff_');
    
    // Map StaffMember role to UserAuth role
    let userAuthRole: UserAuth['role'] = 'staff'; // default
    if (role === 'Dentist') userAuthRole = 'doctor';
    else if (role === 'Hygienist') userAuthRole = 'hygienist';
    else if (role === 'Assistant') userAuthRole = 'assistant';
    else if (role === 'Receptionist') userAuthRole = 'staff'; // Could be 'receptionist' if defined in UserAuth
    else if (role === 'Admin') userAuthRole = 'admin';


    const newUser: UserAuth = {
      id: newStaffUserId,
      name,
      email,
      passwordHash: `$2a$10$mockStaffPassword${generateId()}`, // Mock password hash for login capability
      role: userAuthRole,
    };
    db.users.push(newUser);

    // Also add to db.staff for compatibility with UI relying on mockStaff structure
    const newStaffMemberRecord: StaffMember = {
        id: newStaffUserId,
        name,
        email,
        role,
    };
    db.staff.push(newStaffMemberRecord);

    return NextResponse.json(newStaffMemberRecord, { status: 201 });

  } catch (error) {
    console.error('Error creating staff member:', error);
    return NextResponse.json({ message: 'Error creating staff member. Please check logs.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // TODO: Add authorization if needed for fetching all staff
  const { searchParams } = new URL(request.url);
  const roleQuery = searchParams.get('role'); // e.g., "Dentist", "Hygienist"

  let staffList: StaffMember[] = db.staff; // Use the mutable db.staff

  if (roleQuery) {
    staffList = staffList.filter(s => s.role.toLowerCase() === roleQuery.toLowerCase());
  }
  
  // Sort by name for consistent dropdown order
  staffList.sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(staffList, { status: 200 });
}
