import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { ensureDbSync } from '@/lib/models';

// GET /api/pages/[id]/conversations — list conversations for a page
export async function GET(request, { params }) {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        const { Page, Conversation, Message } = await ensureDbSync();
        const page = await Page.findOne({ where: { id, userId: user.id } });
        if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

        const conversations = await Conversation.findAll({
            where: { pageId: page.id },
            include: [{
                model: Message,
                as: 'messages',
                limit: 1,
                order: [['createdAt', 'DESC']],
            }],
            order: [['updatedAt', 'DESC']],
        });

        const result = conversations.map((c) => ({
            id: c.id,
            senderId: c.senderId,
            senderName: c.senderName,
            lastMessage: c.messages?.[0]?.content || 'No messages yet',
            lastMessageAt: c.messages?.[0]?.createdAt || c.createdAt,
            updatedAt: c.updatedAt,
        }));

        return NextResponse.json({ conversations: result });
    } catch (error) {
        console.error('Conversations error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }
}
