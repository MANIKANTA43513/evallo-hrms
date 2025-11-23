import { db } from '@/db';
import { employeeTeams } from '@/db/schema';

async function main() {
    const sampleEmployeeTeams = [
        {
            employeeId: 1,
            teamId: 1,
            assignedAt: new Date('2024-01-15').toISOString(),
        },
        {
            employeeId: 2,
            teamId: 2,
            assignedAt: new Date('2024-01-16').toISOString(),
        },
        {
            employeeId: 3,
            teamId: 2,
            assignedAt: new Date('2024-01-17').toISOString(),
        },
        {
            employeeId: 4,
            teamId: 3,
            assignedAt: new Date('2024-01-18').toISOString(),
        },
        {
            employeeId: 4,
            teamId: 1,
            assignedAt: new Date('2024-01-19').toISOString(),
        },
        {
            employeeId: 5,
            teamId: 3,
            assignedAt: new Date('2024-01-20').toISOString(),
        },
        {
            employeeId: 5,
            teamId: 1,
            assignedAt: new Date('2024-01-21').toISOString(),
        },
    ];

    await db.insert(employeeTeams).values(sampleEmployeeTeams);
    
    console.log('✅ Employee teams seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});