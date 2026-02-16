import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';

export async function GET(request) {
    const user = await authenticateRequest(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
        },
    });
}
