import { NextResponse } from 'next/server';
import { BtcService } from '../../../lib/services';

export async function GET() {
    try {
        const btcPrice = await BtcService.getCurrentPrice();
        return NextResponse.json({ btc: btcPrice });
    } catch (error) {
        let errorMessage = 'An unknown error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error('Error fetching BTC value:', errorMessage);
        return NextResponse.json({ error: `An error occurred while fetching BTC value: ${errorMessage}` }, { status: 500 });
    }
} 