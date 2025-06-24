import { NextResponse } from 'next/server';
import { GuessService } from '../../../lib/services';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const result = await GuessService.checkGuessResult(userId);

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error checking guess resolution:', error);
        return NextResponse.json({ error: 'An error occurred while checking guess resolution' }, { status: 500 });
    }
} 