// src/app/api/staff/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { generateId } from '@/lib/mockServerDb';
import type { UserAuth } from '@/lib/mockServerDb';
import type { StaffMember } from '@/lib/types';
import { getDb } from '@/lib/db';

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
  
  const db = await getDb();

  try {
    const body = await request.json();
    const validation = createStaffSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, role: staffMemberRole } = validation.data;

    const emailSuffix = "@dentalhub.com";
    const simpleName = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/gi, '');
    
    const staffCount = await db.get("SELECT COUNT(*) as count FROM users WHERE role != 'patient'");
    const email = `${simpleName}${staffCount.count + 1}${emailSuffix}`;

    const existingUser = await db.get("SELECT id FROM users WHERE email = ?", email);
    if (existingUser) {
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
    
    await db.run(
        'INSERT INTO users (id, name, email, passwordHash, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        newUser.id, newUser.name, newUser.email, newUser.passwordHash, newUser.role, newUser.createdAt, newUser.updatedAt
    );
    
    const newStaffMemberResponse: StaffMember = {
        id: newStaffUserId,
        name,
        email,
        role: staffMemberRole,
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
  const db = await getDb();

  // If ?allUsers=true is passed, return all users regardless of role (for suggestions)
  if (allUsersQuery === 'true') {
    const allUsers = await db.all("SELECT id, name, email, role, phone FROM users");
    return NextResponse.json(allUsers, { status: 200 });
  }

  let staffUsers: UserAuth[];

  if (roleQuery) {
      let roleInDb: UserAuth['role'] | null = null;
      if (roleQuery === 'Dentist') roleInDb = 'doctor';
      else if (roleQuery === 'Hygienist') roleInDb = 'hygienist';
      
      if (roleInDb) {
        staffUsers = await db.all("SELECT * FROM users WHERE role = ?", roleInDb);
      } else {
        staffUsers = await db.all("SELECT * FROM users WHERE role NOT IN ('patient') AND role = ?", roleQuery.toLowerCase());
      }
  } else {
    staffUsers = await db.all("SELECT * FROM users WHERE role != 'patient'");
  }
  
  let staffList: StaffMember[] = staffUsers
    .map(user => {
      const staffRole = mapUserAuthRoleToStaffMemberRole(user.role);
      if (!staffRole) return null;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: staffRole,
      };
    })
    .filter((s): s is StaffMember => s !== null);
  
  staffList.sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(staffList, { status: 200 });
}
