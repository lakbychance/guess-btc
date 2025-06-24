import { NextResponse } from 'next/server';
import { UserService } from '../../../lib/services';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username } = body;

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const existingUser = await UserService.findUserByUsername(username);

        if (existingUser) {
            return NextResponse.json({ error: 'Username is already taken' }, { status: 403 });
        }

        const newUser = await UserService.createUser({ username });

        return NextResponse.json({ userId: newUser.id });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'An error occurred while creating the user' }, { status: 500 });
    }
} 