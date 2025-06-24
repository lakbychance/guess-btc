import prisma from '../prisma';
import { Guess } from '@prisma/client';
import { BtcService } from './btcService';

export interface CreateGuessData {
    userId: Guess['userId'];
    prediction: Guess['prediction'];
    recordedBTCValue: Guess['recordedBTCValue'];
}


export interface GuessResolutionResult {
    resolved: boolean;
    isCorrect?: boolean;
    updatedScore?: number;
}

export interface CheckGuessResult {
    resolved: boolean;
    isCorrect?: boolean;
    updatedScore?: number;
}

export class GuessService {

    static GUESS_RESOLUTION_THRESHOLD_MS = 60000;

    static getGuessResolutionThresholdMs(): number {
        return 60000;
    }

    static async createGuess(data: CreateGuessData): Promise<Guess> {
        const guess = await prisma.guess.create({
            data: {
                userId: data.userId,
                prediction: data.prediction,
                recordedBTCValue: data.recordedBTCValue
            }
        });
        return guess;
    }

    static async getLatestGuessForUser(userId: string): Promise<Guess | null> {
        const guess = await prisma.guess.findFirst({
            where: {
                userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return guess;
    }

    static async checkGuessResult(userId: string): Promise<CheckGuessResult> {
        const latestGuess = await this.getLatestGuessForUser(userId);

        if (!latestGuess) {
            throw new Error('No guess found for user');
        }

        if (latestGuess.resolvedAt) {
            return { resolved: true };
        }

        const currentTime = new Date();
        const timeDifference = currentTime.getTime() - latestGuess.createdAt.getTime();

        if (timeDifference < this.GUESS_RESOLUTION_THRESHOLD_MS) {
            return { resolved: false };
        }

        // Time to resolve the guess
        const currentBtcPrice = await BtcService.getCurrentPrice();

        const hasPriceChanged = currentBtcPrice !== latestGuess.recordedBTCValue;
        const wasPriceHigher = currentBtcPrice > latestGuess.recordedBTCValue;

        if (!hasPriceChanged) {
            return { resolved: false };
        }

        const predictionWasUp = latestGuess.prediction === 'UP';
        const isCorrect = (predictionWasUp && wasPriceHigher) || (!predictionWasUp && !wasPriceHigher);

        const result = await this.resolveGuess(latestGuess.id, isCorrect, userId);

        return result;
    }

    static async resolveGuess(
        guessId: string,
        isCorrect: boolean,
        userId: string
    ): Promise<GuessResolutionResult> {

        const [, updatedUser] = await prisma.$transaction(async (tx) => {

            const currentUser = await tx.user.findUnique({
                where: { id: userId },
                select: { score: true }
            });

            if (!currentUser) {
                throw new Error('User not found');
            }


            const scoreChange = isCorrect ? 1 : -1;
            const newScore = Math.max(0, currentUser.score + scoreChange);


            return Promise.all([
                tx.guess.update({
                    where: { id: guessId },
                    data: {
                        resolvedAt: new Date(),
                        isCorrect
                    }
                }),
                tx.user.update({
                    where: { id: userId },
                    data: { score: newScore }
                })
            ]);
        });

        return {
            resolved: true,
            isCorrect,
            updatedScore: updatedUser.score
        };
    }

    static async hasUnresolvedGuess(userId: string): Promise<boolean> {
        const latestGuess = await this.getLatestGuessForUser(userId);
        return latestGuess !== null && latestGuess.resolvedAt === null;
    }
} 