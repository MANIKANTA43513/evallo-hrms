import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { logs, users } from '@/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

// GET all logs for the organization
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logsList = await db
      .select({
        log: logs,
        user: users,
      })
      .from(logs)
      .leftJoin(users, eq(logs.userId, users.id))
      .where(eq(logs.organizationId, authUser.organizationId))
      .orderBy(desc(logs.timestamp))
      .limit(100);

    const formattedLogs = logsList.map(({ log, user }) => ({
      ...log,
      userEmail: user?.email || 'System',
    }));

    return NextResponse.json({ logs: formattedLogs });
  } catch (error) {
    console.error('Get logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
