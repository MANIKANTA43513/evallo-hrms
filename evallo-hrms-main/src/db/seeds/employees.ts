import { db } from '@/db';
import { employees } from '@/db/schema';

async function main() {
    const sampleEmployees = [
        {
            name: 'Alice Johnson',
            email: 'alice.johnson@evallo.com',
            position: 'Software Engineer',
            organizationId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Bob Smith',
            email: 'bob.smith@evallo.com',
            position: 'Product Manager',
            organizationId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Carol Davis',
            email: 'carol.davis@evallo.com',
            position: 'Designer',
            organizationId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'David Wilson',
            email: 'david.wilson@evallo.com',
            position: 'QA Engineer',
            organizationId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Eva Martinez',
            email: 'eva.martinez@evallo.com',
            position: 'DevOps Engineer',
            organizationId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];

    await db.insert(employees).values(sampleEmployees);
    
    console.log('✅ Employees seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});