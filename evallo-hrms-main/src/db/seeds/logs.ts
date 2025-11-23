import { db } from '@/db';
import { logs } from '@/db/schema';

async function main() {
    const sampleLogs = [
        {
            userId: 1,
            action: 'LOGIN',
            entityType: 'USER',
            entityId: 1,
            details: {
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0'
            },
            timestamp: new Date('2024-01-15T08:30:00').toISOString(),
            organizationId: 1,
        },
        {
            userId: 1,
            action: 'CREATE',
            entityType: 'EMPLOYEE',
            entityId: 1,
            details: {
                name: 'Alice Johnson',
                position: 'Software Engineer'
            },
            timestamp: new Date('2024-01-15T09:00:00').toISOString(),
            organizationId: 1,
        },
        {
            userId: 1,
            action: 'CREATE',
            entityType: 'EMPLOYEE',
            entityId: 2,
            details: {
                name: 'Bob Smith',
                position: 'Product Manager'
            },
            timestamp: new Date('2024-01-15T09:15:00').toISOString(),
            organizationId: 1,
        },
        {
            userId: 1,
            action: 'CREATE',
            entityType: 'EMPLOYEE',
            entityId: 3,
            details: {
                name: 'Carol Davis',
                position: 'Designer'
            },
            timestamp: new Date('2024-01-15T09:30:00').toISOString(),
            organizationId: 1,
        },
        {
            userId: 1,
            action: 'CREATE',
            entityType: 'EMPLOYEE',
            entityId: 4,
            details: {
                name: 'David Wilson',
                position: 'QA Engineer'
            },
            timestamp: new Date('2024-01-15T09:45:00').toISOString(),
            organizationId: 1,
        },
        {
            userId: 1,
            action: 'CREATE',
            entityType: 'EMPLOYEE',
            entityId: 5,
            details: {
                name: 'Eva Martinez',
                position: 'DevOps Engineer'
            },
            timestamp: new Date('2024-01-15T10:00:00').toISOString(),
            organizationId: 1,
        },
        {
            userId: 1,
            action: 'CREATE',
            entityType: 'TEAM',
            entityId: 1,
            details: {
                name: 'Engineering',
                description: 'Software development and technical teams'
            },
            timestamp: new Date('2024-01-15T10:30:00').toISOString(),
            organizationId: 1,
        },
        {
            userId: 1,
            action: 'CREATE',
            entityType: 'TEAM',
            entityId: 2,
            details: {
                name: 'Product',
                description: 'Product management and design teams'
            },
            timestamp: new Date('2024-01-15T10:45:00').toISOString(),
            organizationId: 1,
        },
        {
            userId: 1,
            action: 'CREATE',
            entityType: 'TEAM',
            entityId: 3,
            details: {
                name: 'Operations',
                description: 'DevOps and quality assurance teams'
            },
            timestamp: new Date('2024-01-15T11:00:00').toISOString(),
            organizationId: 1,
        },
        {
            userId: 1,
            action: 'ASSIGN',
            entityType: 'EMPLOYEE_TEAM',
            entityId: 1,
            details: {
                employeeId: 1,
                teamId: 1,
                employeeName: 'Alice Johnson',
                teamName: 'Engineering'
            },
            timestamp: new Date('2024-01-15T11:30:00').toISOString(),
            organizationId: 1,
        },
        {
            userId: 1,
            action: 'ASSIGN',
            entityType: 'EMPLOYEE_TEAM',
            entityId: 4,
            details: {
                employeeId: 4,
                teamId: 3,
                employeeName: 'David Wilson',
                teamName: 'Operations'
            },
            timestamp: new Date('2024-01-15T11:45:00').toISOString(),
            organizationId: 1,
        },
        {
            userId: 1,
            action: 'ASSIGN',
            entityType: 'EMPLOYEE_TEAM',
            entityId: 5,
            details: {
                employeeId: 5,
                teamId: 1,
                employeeName: 'Eva Martinez',
                teamName: 'Engineering'
            },
            timestamp: new Date('2024-01-15T12:00:00').toISOString(),
            organizationId: 1,
        }
    ];

    await db.insert(logs).values(sampleLogs);
    
    console.log('✅ Logs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});