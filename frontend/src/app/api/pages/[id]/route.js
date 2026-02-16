import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { updatePageSettings, deletePage } from '@/lib/models';

// PUT /api/pages/[id] — update system prompt and context
export async function PUT(request, { params }) {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        const { systemPrompt, context } = await request.json();
        const page = await updatePageSettings(id, user.id, { systemPrompt, context });

        if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

        return NextResponse.json({
            message: 'Settings updated successfully',
            systemPrompt: page.system_prompt,
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
        await deletePage(id, user.id);
        return NextResponse.json({ message: 'Page disconnected successfully' });
    } catch (error) {
        console.error('Delete page error:', error.message);
        return NextResponse.json({ error: 'Failed to disconnect page' }, { status: 500 });
    }
}
