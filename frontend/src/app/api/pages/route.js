import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import * as facebookService from '@/lib/facebook';
import { getDb } from '@/lib/database';

// GET /api/pages — list Facebook pages the user can manage
export async function GET(request) {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const sql = getDb();
        const fbPages = await facebookService.getUserPages(user.access_token);
        const connectedPages = await sql`SELECT page_id FROM pages WHERE user_id = ${user.id}`;
        const connectedPageIds = new Set(connectedPages.map((p) => p.page_id));

        const pages = fbPages.map((p) => ({
            pageId: p.id,
            name: p.name,
            picture: p.picture?.data?.url || null,
            fanCount: p.fan_count || 0,
            category: p.category || 'N/A',
            isConnected: connectedPageIds.has(p.id),
        }));

        return NextResponse.json({ pages });
    } catch (error) {
        console.error('List pages error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
    }
}

// POST /api/pages — connect a page
export async function POST(request) {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { getPageByPageId, createPage } = await import('@/lib/models');
        const { pageId } = await request.json();
        if (!pageId) return NextResponse.json({ error: 'pageId is required' }, { status: 400 });

        const fbPages = await facebookService.getUserPages(user.access_token);
        const fbPage = fbPages.find((p) => p.id === pageId);
        if (!fbPage) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

        const existing = await getPageByPageId(pageId);
        if (existing) return NextResponse.json({ error: 'Page is already connected' }, { status: 409 });

        await facebookService.subscribePageWebhook(pageId, fbPage.access_token);

        const page = await createPage({
            pageId: fbPage.id,
            name: fbPage.name,
            accessToken: fbPage.access_token,
            userId: user.id,
        });

        return NextResponse.json({
            message: 'Page connected successfully!',
            page: { id: page.id, pageId: page.page_id, name: page.name, isActive: page.is_active },
        });
    } catch (error) {
        console.error('Connect page error:', error.message);
        return NextResponse.json({ error: 'Failed to connect page' }, { status: 500 });
    }
}
