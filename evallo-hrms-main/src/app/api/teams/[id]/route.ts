import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teams, logs, employeeTeams, employees } from '@/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

// GET single team with members
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
    const teamId = parseInt(id);

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

    // Get team members
    const members = await db
      .select({
        employee: employees,
        assignedAt: employeeTeams.assignedAt,
      })
      .from(employeeTeams)
      .innerJoin(employees, eq(employeeTeams.employeeId, employees.id))
      .where(eq(employeeTeams.teamId, teamId));

    return NextResponse.json({
      team: {
        ...team,
        members: members.map(m => ({ ...m.employee, assignedAt: m.assignedAt })),
      },
    });
  } catch (error) {
    console.error('Get team error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update team
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
    const teamId = parseInt(id);
    const body = await request.json();
    const { name, description } = body;

    // Verify team belongs to organization
    const [existing] = await db
      .select()
      .from(teams)
      .where(
        and(
          eq(teams.id, teamId),
          eq(teams.organizationId, authUser.organizationId)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const [updatedTeam] = await db
      .update(teams)
      .set({
        name: name || existing.name,
        description: description !== undefined ? description : existing.description,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(teams.id, teamId))
      .returning();

    // Log the update
    await db.insert(logs).values({
      userId: authUser.userId,
      action: 'UPDATE',
      entityType: 'TEAM',
      entityId: teamId,
      details: {
        before: { name: existing.name, description: existing.description },
        after: { name: updatedTeam.name, description: updatedTeam.description },
      },
      timestamp: new Date().toISOString(),
      organizationId: authUser.organizationId,
    });

    return NextResponse.json({
      message: 'Team updated successfully',
      team: updatedTeam,
    });
  } catch (error) {
    console.error('Update team error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE team
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

    // Verify team belongs to organization
    const [existing] = await db
      .select()
      .from(teams)
      .where(
        and(
          eq(teams.id, teamId),
          eq(teams.organizationId, authUser.organizationId)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Delete team assignments first
    await db.delete(employeeTeams).where(eq(employeeTeams.teamId, teamId));

    // Delete team
    await db.delete(teams).where(eq(teams.id, teamId));

    // Log the deletion
    await db.insert(logs).values({
      userId: authUser.userId,
      action: 'DELETE',
      entityType: 'TEAM',
      entityId: teamId,
      details: { name: existing.name, description: existing.description },
      timestamp: new Date().toISOString(),
      organizationId: authUser.organizationId,
    });

    return NextResponse.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
