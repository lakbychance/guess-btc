import { NextResponse } from 'next/server';
import { UserService } from '../../../../lib/services';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
    try {
        const { userId } = params;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const user = await UserService.getUserScore(userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'An error occurred while fetching user data' }, { status: 500 });
    }
} 