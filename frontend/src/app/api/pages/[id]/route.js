import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { Page, Conversation, Message, ensureDbSync } from '@/lib/models';

// PUT /api/pages/[id]/context — update system prompt and context
export async function PUT(request, { params }) {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        await ensureDbSync();
        const { systemPrompt, context } = await request.json();
        const page = await Page.findOne({ where: { id, userId: user.id } });
        if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

        if (systemPrompt !== undefined) page.systemPrompt = systemPrompt;
        if (context !== undefined) page.context = context;
        await page.save();

        return NextResponse.json({
            message: 'Settings updated successfully',
            systemPrompt: page.systemPrompt,
            context: page.context,
        });
    } catch (error) {
        console.error('Update context error:', error.message);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}

// DELETE /api/pages/[id] — disconnect a page
export async function DELETE(request, { params }) {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        await ensureDbSync();
        const page = await Page.findOne({ where: { id, userId: user.id } });
        if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

        await page.destroy();
        return NextResponse.json({ message: 'Page disconnected successfully' });
    } catch (error) {
        console.error('Delete page error:', error.message);
        return NextResponse.json({ error: 'Failed to disconnect page' }, { status: 500 });
    }
}
