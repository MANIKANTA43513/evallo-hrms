import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teams, logs, employeeTeams, employees } from '@/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// GET all teams for the organization with employee counts
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamsList = await db
      .select()
      .from(teams)
      .where(eq(teams.organizationId, authUser.organizationId));

    // Get employee counts and members for each team
    const teamsWithMembers = await Promise.all(
      teamsList.map(async (team) => {
        const assignments = await db
          .select({
            employee: employees,
            assignedAt: employeeTeams.assignedAt,
          })
          .from(employeeTeams)
          .innerJoin(employees, eq(employeeTeams.employeeId, employees.id))
          .where(eq(employeeTeams.teamId, team.id));

        return {
          ...team,
          memberCount: assignments.length,
          members: assignments.map(a => a.employee),
        };
      })
    );

    return NextResponse.json({ teams: teamsWithMembers });
  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new team
export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      );
    }

    const [newTeam] = await db
      .insert(teams)
      .values({
        name,
        description: description || null,
        organizationId: authUser.organizationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    // Log the creation
    await db.insert(logs).values({
      userId: authUser.userId,
      action: 'CREATE',
      entityType: 'TEAM',
      entityId: newTeam.id,
      details: { name, description },
      timestamp: new Date().toISOString(),
      organizationId: authUser.organizationId,
    });

    return NextResponse.json(
      { message: 'Team created successfully', team: newTeam },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
