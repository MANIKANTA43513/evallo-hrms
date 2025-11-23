import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { organizations, users } from '@/db/schema';
import bcrypt from 'bcrypt';
import { generateToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationName, email, password } = body;

    // Validate input
    if (!organizationName || !email || !password) {
      return NextResponse.json(
        { error: 'Organization name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if organization email already exists
    const existingOrg = await db.select().from(organizations).where(eq(organizations.email, email)).limit(1);
    if (existingOrg.length > 0) {
      return NextResponse.json(
        { error: 'Organization with this email already exists' },
        { status: 400 }
      );
    }

    // Check if user email already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organization
    const [newOrg] = await db.insert(organizations).values({
      name: organizationName,
      email: email,
      createdAt: new Date().toISOString(),
    }).returning();

    // Create user
    const [newUser] = await db.insert(users).values({
      email: email,
      password: hashedPassword,
      organizationId: newOrg.id,
      createdAt: new Date().toISOString(),
    }).returning();

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      organizationId: newUser.organizationId,
    });

    return NextResponse.json({
      message: 'Organization and user created successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        organizationId: newUser.organizationId,
        organizationName: newOrg.name,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
