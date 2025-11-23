import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teams, employees, employeeTeams, logs } from '@/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

// POST assign employee to team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const teamId = parseInt(id);
    const body = await request.json();
    const { employeeId } = body;

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Verify team belongs to organization
    const [team] = await db
      .select()
      .from(teams)
      .where(
        and(
          eq(teams.id, teamId),
          eq(teams.organizationId, authUser.organizationId)
        )
      )
      .limit(1);

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Verify employee belongs to organization
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

    // Check if assignment already exists
    const [existing] = await db
      .select()
      .from(employeeTeams)
      .where(
        and(
          eq(employeeTeams.employeeId, employeeId),
          eq(employeeTeams.teamId, teamId)
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: 'Employee is already assigned to this team' },
        { status: 400 }
      );
    }

    // Create assignment
    const [assignment] = await db
      .insert(employeeTeams)
      .values({
        employeeId,
        teamId,
        assignedAt: new Date().toISOString(),
      })
      .returning();

    // Log the assignment
    await db.insert(logs).values({
      userId: authUser.userId,
      action: 'ASSIGN',
      entityType: 'EMPLOYEE_TEAM',
      entityId: assignment.id,
      details: {
        employeeId,
        teamId,
        employeeName: employee.name,
        teamName: team.name,
      },
      timestamp: new Date().toISOString(),
      organizationId: authUser.organizationId,
    });

    return NextResponse.json(
      { message: 'Employee assigned to team successfully', assignment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Assign employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE unassign employee from team
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
    const teamId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const employeeId = parseInt(searchParams.get('employeeId') || '0');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Verify team belongs to organization
    const [team] = await db
      .select()
      .from(teams)
      .where(
        and(
          eq(teams.id, teamId),
          eq(teams.organizationId, authUser.organizationId)
        )
      )
      .limit(1);

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Verify employee belongs to organization
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

    // Check if assignment exists
    const [existing] = await db
      .select()
      .from(employeeTeams)
      .where(
        and(
          eq(employeeTeams.employeeId, employeeId),
          eq(employeeTeams.teamId, teamId)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: 'Employee is not assigned to this team' },
        { status: 404 }
      );
    }

    // Delete assignment
    await db
      .delete(employeeTeams)
      .where(
        and(
          eq(employeeTeams.employeeId, employeeId),
          eq(employeeTeams.teamId, teamId)
        )
      );

    // Log the unassignment
    await db.insert(logs).values({
      userId: authUser.userId,
      action: 'UNASSIGN',
      entityType: 'EMPLOYEE_TEAM',
      entityId: existing.id,
      details: {
        employeeId,
        teamId,
        employeeName: employee.name,
        teamName: team.name,
      },
      timestamp: new Date().toISOString(),
      organizationId: authUser.organizationId,
    });

    return NextResponse.json({
      message: 'Employee unassigned from team successfully',
    });
  } catch (error) {
    console.error('Unassign employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
