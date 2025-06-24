import { NextResponse } from 'next/server';
import { GuessService } from '../../../lib/services';
import { PredictionType } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, prediction, recordedBTCValue } = body;

        if (!userId || !prediction || recordedBTCValue === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (prediction !== 'UP' && prediction !== 'DOWN') {
            return NextResponse.json({ error: 'Invalid prediction value' }, { status: 400 });
        }

        // Check for an existing unresolved guess
        const hasUnresolvedGuess = await GuessService.hasUnresolvedGuess(userId);

        if (hasUnresolvedGuess) {
            return NextResponse.json({ error: 'An unresolved guess already exists for this user' }, { status: 403 });
        }

        // Create a new guess
        const newGuess = await GuessService.createGuess({
            userId,
            prediction: prediction as PredictionType,
            recordedBTCValue,
        });

        return NextResponse.json(newGuess);
    } catch (error) {
        console.error('Error making guess:', error);
        return NextResponse.json({ error: 'An error occurred while making the guess' }, { status: 500 });
    }
} 