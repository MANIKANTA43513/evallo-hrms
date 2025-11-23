import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const hashedPassword = bcrypt.hashSync("admin123", 10);
    
    const sampleUsers = [
        {
            email: "admin@evallo.com",
            password: hashedPassword,
            organizationId: 1,
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});