import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Organizations table
export const organizations = sqliteTable('organizations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: text('created_at').notNull(),
});

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  createdAt: text('created_at').notNull(),
});

// Employees table
export const employees = sqliteTable('employees', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  position: text('position').notNull(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Teams table
export const teams = sqliteTable('teams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// EmployeeTeams junction table
export const employeeTeams = sqliteTable('employee_teams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  employeeId: integer('employee_id').notNull().references(() => employees.id),
  teamId: integer('team_id').notNull().references(() => teams.id),
  assignedAt: text('assigned_at').notNull(),
});

// Logs table (audit trail)
export const logs = sqliteTable('logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id'),
  details: text('details', { mode: 'json' }),
  timestamp: text('timestamp').notNull(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
});