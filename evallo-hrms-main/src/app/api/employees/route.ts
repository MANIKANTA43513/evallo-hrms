import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { employees, logs } from '@/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

// GET all employees for the organization
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employeesList = await db
      .select()
      .from(employees)
      .where(eq(employees.organizationId, authUser.organizationId));

    return NextResponse.json({ employees: employeesList });
  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new employee
export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, position } = body;

    if (!name || !email || !position) {
      return NextResponse.json(
        { error: 'Name, email, and position are required' },
        { status: 400 }
      );
    }

    const [newEmployee] = await db
      .insert(employees)
      .values({
        name,
        email,
        position,
        organizationId: authUser.organizationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    // Log the creation
    await db.insert(logs).values({
      userId: authUser.userId,
      action: 'CREATE',
      entityType: 'EMPLOYEE',
      entityId: newEmployee.id,
      details: { name, email, position },
      timestamp: new Date().toISOString(),
      organizationId: authUser.organizationId,
    });

    return NextResponse.json(
      { message: 'Employee created successfully', employee: newEmployee },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
