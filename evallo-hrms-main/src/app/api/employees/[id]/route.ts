import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { employees, logs } from '@/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

// GET single employee
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const employeeId = parseInt(id);

    const [employee] = await db
      .select()
      .from(employees)
      .where(
        and(
          eq(employees.id, employeeId),
          eq(employees.organizationId, authUser.organizationId)
        )
      )
      .limit(1);

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ employee });
  } catch (error) {
    console.error('Get employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const employeeId = parseInt(id);
    const body = await request.json();
    const { name, email, position } = body;

    // Verify employee belongs to organization
    const [existing] = await db
      .select()
      .from(employees)
      .where(
        and(
          eq(employees.id, employeeId),
          eq(employees.organizationId, authUser.organizationId)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const [updatedEmployee] = await db
      .update(employees)
      .set({
        name: name || existing.name,
        email: email || existing.email,
        position: position || existing.position,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(employees.id, employeeId))
      .returning();

    // Log the update
    await db.insert(logs).values({
      userId: authUser.userId,
      action: 'UPDATE',
      entityType: 'EMPLOYEE',
      entityId: employeeId,
      details: { 
        before: { name: existing.name, email: existing.email, position: existing.position },
        after: { name: updatedEmployee.name, email: updatedEmployee.email, position: updatedEmployee.position }
      },
      timestamp: new Date().toISOString(),
      organizationId: authUser.organizationId,
    });

    return NextResponse.json({
      message: 'Employee updated successfully',
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error('Update employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const employeeId = parseInt(id);

    // Verify employee belongs to organization
    const [existing] = await db
      .select()
      .from(employees)
      .where(
        and(
          eq(employees.id, employeeId),
          eq(employees.organizationId, authUser.organizationId)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    await db.delete(employees).where(eq(employees.id, employeeId));

    // Log the deletion
    await db.insert(logs).values({
      userId: authUser.userId,
      action: 'DELETE',
      entityType: 'EMPLOYEE',
      entityId: employeeId,
      details: { name: existing.name, email: existing.email, position: existing.position },
      timestamp: new Date().toISOString(),
      organizationId: authUser.organizationId,
    });

    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
