import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { Page, Conversation, ensureDbSync } from '@/lib/models';

// GET /api/pages/connected — list connected pages
export async function GET(request) {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await ensureDbSync();
        const pages = await Page.findAll({
            where: { userId: user.id },
            include: [{ model: Conversation, as: 'conversations', attributes: ['id'] }],
            order: [['createdAt', 'DESC']],
        });

        const result = pages.map((p) => ({
            id: p.id,
            pageId: p.pageId,
            name: p.name,
            isActive: p.isActive,
            systemPrompt: p.systemPrompt,
            context: p.context,
            conversationCount: p.conversations?.length || 0,
            connectedAt: p.createdAt,
        }));

        return NextResponse.json({ pages: result });
    } catch (error) {
        console.error('Connected pages error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch connected pages' }, { status: 500 });
    }
}
