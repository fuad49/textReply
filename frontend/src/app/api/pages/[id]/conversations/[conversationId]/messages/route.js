import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { Page, Message, ensureDbSync } from '@/lib/models';

// GET /api/pages/[pageId]/conversations/[conversationId]/messages
export async function GET(request, { params }) {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, conversationId } = await params;

    try {
        await ensureDbSync();
        const page = await Page.findOne({ where: { id, userId: user.id } });
        if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

        const messages = await Message.findAll({
            where: { conversationId },
            order: [['createdAt', 'ASC']],
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Messages error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}
