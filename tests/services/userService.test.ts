import { test, expect } from '@playwright/test';
import { UserService } from '../../lib/services/userService';
import { cleanupTestData } from '../utils/testDb';

test.describe('UserService', () => {
    test.beforeAll(async () => {
        await cleanupTestData();
    });

    test.afterAll(async () => {
        await cleanupTestData();
    });


    test('should create a new user successfully', async () => {
        const userData = { username: 'johndoe' };

        const user = await UserService.createUser(userData);

        expect(user).toBeTruthy();
        expect(user.id).toBeTruthy();
        expect(user.username).toBe('johndoe');
        expect(user.score).toBe(0);
    });

}); 