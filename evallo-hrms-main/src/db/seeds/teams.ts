import { db } from '@/db';
import { teams } from '@/db/schema';

async function main() {
    const sampleTeams = [
        {
            name: 'Engineering',
            description: 'Software development and technical teams',
            organizationId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Product',
            description: 'Product management and design teams',
            organizationId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Operations',
            description: 'DevOps and quality assurance teams',
            organizationId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(teams).values(sampleTeams);
    
    console.log('✅ Teams seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});