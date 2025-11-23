import { db } from '@/db';
import { organizations } from '@/db/schema';

async function main() {
    const sampleOrganizations = [
        {
            name: 'Evallo Technologies',
            email: 'admin@evallo.com',
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(organizations).values(sampleOrganizations);
    
    console.log('✅ Organizations seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});