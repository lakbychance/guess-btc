import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export const testDb = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

export async function cleanupTestData() {
    try {
        await testDb.guess.deleteMany({});
        await testDb.user.deleteMany({});
    } catch (error) {
        console.error('Error cleaning up test data:', error);
        throw error;
    }
}

export async function createTestUser(username: string = 'testuser') {
    return await testDb.user.create({
        data: {
            username,
        },
    });
}

export async function disconnectTestDb() {
    await testDb.$disconnect();
} 