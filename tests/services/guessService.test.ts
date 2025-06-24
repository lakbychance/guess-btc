import { test, expect } from '@playwright/test';
import { GuessService } from '../../lib/services/guessService';
import { BtcService } from '../../lib/services/btcService';
import { cleanupTestData, createTestUser, testDb } from '../utils/testDb';
import { PredictionType } from '@prisma/client';

const mockBtcService = {
    getCurrentPrice: async () => 50000
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

test.describe('GuessService', () => {
    let testUser: { id: string; username: string; score: number };

    test.beforeAll(async () => {
        await cleanupTestData();
        testUser = await createTestUser('testuser');
        BtcService.getCurrentPrice = mockBtcService.getCurrentPrice;
        GuessService.GUESS_RESOLUTION_THRESHOLD_MS = 2000;
    });

    test.beforeEach(async () => {
        await testDb.guess.deleteMany({});
    });

    test.afterAll(async () => {
        await cleanupTestData();
    });

    test.describe('createGuess (makeGuess)', () => {
        test('should create a guess successfully with valid data', async () => {
            const guessData = {
                userId: testUser.id,
                prediction: 'UP' as PredictionType,
                recordedBTCValue: 45000
            };

            const guess = await GuessService.createGuess(guessData);

            expect(guess).toBeTruthy();
            expect(guess.id).toBeTruthy();
            expect(guess.userId).toBe(testUser.id);
            expect(guess.prediction).toBe('UP');
            expect(guess.recordedBTCValue).toBe(45000);
            expect(guess.createdAt).toBeTruthy();
            expect(guess.resolvedAt).toBeNull();
            expect(guess.isCorrect).toBeNull();
        });

        test('should get latest guess for user', async () => {

            await GuessService.createGuess({
                userId: testUser.id,
                prediction: 'UP' as PredictionType,
                recordedBTCValue: 45000
            });

            const secondGuess = await GuessService.createGuess({
                userId: testUser.id,
                prediction: 'DOWN' as PredictionType,
                recordedBTCValue: 46000
            });

            const latestGuess = await GuessService.getLatestGuessForUser(testUser.id);

            expect(latestGuess).toBeTruthy();
            expect(latestGuess!.id).toBe(secondGuess.id);
            expect(latestGuess!.prediction).toBe('DOWN');
        });

    });

    test.describe('checkGuessResult', () => {
        test('should throw error when no guess exists for user', async () => {
            await expect(GuessService.checkGuessResult(testUser.id)).rejects.toThrow('No guess found for user');
        });

        test('should resolve correctly when a prediction is correct', async () => {


            BtcService.getCurrentPrice = async () => 50000;

            await GuessService.createGuess({
                userId: testUser.id,
                prediction: 'UP' as PredictionType,
                recordedBTCValue: 45000
            });

            await delay(GuessService.GUESS_RESOLUTION_THRESHOLD_MS);

            const result = await GuessService.checkGuessResult(testUser.id);

            expect(result.resolved).toBe(true);
            expect(result.isCorrect).toBe(true);
            expect(result.updatedScore).toBe(1); // User starts with 0, gets +1

        });

        test('should resolve correctly when a prediction is incorrect', async () => {

            BtcService.getCurrentPrice = async () => 40000;

            await GuessService.createGuess({
                userId: testUser.id,
                prediction: 'UP' as PredictionType,
                recordedBTCValue: 45000
            });

            await delay(GuessService.GUESS_RESOLUTION_THRESHOLD_MS);

            const result = await GuessService.checkGuessResult(testUser.id);

            expect(result.resolved).toBe(true);
            expect(result.isCorrect).toBe(false);
            expect(result.updatedScore).toBe(0);

        });

    });

});
