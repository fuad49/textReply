import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { togglePage } from '@/lib/models';

// PUT /api/pages/[id]/toggle — toggle auto-reply on/off
export async function PUT(request, { params }) {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        const page = await togglePage(id, user.id);
        if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

        return NextResponse.json({
            message: `Auto-reply ${page.is_active ? 'enabled' : 'disabled'}`,
            isActive: page.is_active,
        });
    } catch (error) {
        console.error('Toggle error:', error.message);
        return NextResponse.json({ error: 'Failed to toggle page' }, { status: 500 });
    }
}
