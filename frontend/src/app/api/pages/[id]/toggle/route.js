import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { Page, ensureDbSync } from '@/lib/models';

// PUT /api/pages/[id]/toggle — toggle auto-reply on/off
export async function PUT(request, { params }) {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        await ensureDbSync();
        const page = await Page.findOne({ where: { id, userId: user.id } });
        if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

        page.isActive = !page.isActive;
        await page.save();

        return NextResponse.json({
            message: `Auto-reply ${page.isActive ? 'enabled' : 'disabled'}`,
            isActive: page.isActive,
        });
    } catch (error) {
        console.error('Toggle error:', error.message);
        return NextResponse.json({ error: 'Failed to toggle page' }, { status: 500 });
    }
}
