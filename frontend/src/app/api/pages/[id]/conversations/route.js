import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { getPageById, getConversations } from '@/lib/models';

// GET /api/pages/[id]/conversations — list conversations for a page
export async function GET(request, { params }) {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        const page = await getPageById(id, user.id);
        if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

        const conversations = await getConversations(page.id);

        const result = conversations.map((c) => ({
            id: c.id,
            senderId: c.sender_id,
            senderName: c.sender_name,
            lastMessage: c.last_message || 'No messages yet',
            lastMessageAt: c.last_message_at || c.created_at,
            updatedAt: c.updated_at,
        }));

        return NextResponse.json({ conversations: result });
    } catch (error) {
        console.error('Conversations error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }
}
