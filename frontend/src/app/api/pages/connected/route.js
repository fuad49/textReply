import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { getConnectedPages } from '@/lib/models';

// GET /api/pages/connected — list connected pages
export async function GET(request) {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const pages = await getConnectedPages(user.id);

        const result = pages.map((p) => ({
            id: p.id,
            pageId: p.page_id,
            name: p.name,
            isActive: p.is_active,
            systemPrompt: p.system_prompt,
            context: p.context,
            conversationCount: parseInt(p.conversation_count) || 0,
            connectedAt: p.created_at,
        }));

        return NextResponse.json({ pages: result });
    } catch (error) {
        console.error('Connected pages error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch connected pages' }, { status: 500 });
    }
}
