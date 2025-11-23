import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, organizations, logs } from '@/db/schema';
import bcrypt from 'bcrypt';
import { generateToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Get organization details
    const [org] = await db.select().from(organizations).where(eq(organizations.id, user.organizationId)).limit(1);

    // Log the login action
    await db.insert(logs).values({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
      details: {
        email: user.email,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      organizationId: user.organizationId,
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
    });

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
        organizationName: org?.name || '',
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
