import { NextResponse } from 'next/server';

// GET /api/webhook — Facebook verification
export async function GET(request) {
    const url = new URL(request.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === process.env.FB_VERIFY_TOKEN) {
        console.log('✅ Webhook verified successfully!');
        return new Response(challenge, { status: 200 });
    }

    // If no verification params, just return OK (health check)
    if (!mode) {
        return NextResponse.json({ status: 'Webhook endpoint is running' });
    }

    console.error('❌ Webhook verification failed.');
    return new Response('Forbidden', { status: 403 });
}

// POST /api/webhook — receive messages from Facebook
export async function POST(request) {
    // Import heavy dependencies only when needed (not at module load time)
    const { Page, Conversation, Message, ensureDbSync } = await import('@/lib/models');
    const facebookService = await import('@/lib/facebook');
    const { getReply } = await import('@/lib/gemini');

    const body = await request.json();

    if (body.object !== 'page') {
        return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    // Process messages (don't await — respond to Facebook quickly)
    processEntries(body.entry, { Page, Conversation, Message, ensureDbSync }, facebookService, getReply)
        .catch((err) => console.error('Webhook processing error:', err));

    return NextResponse.json({ status: 'ok' }, { status: 200 });
}

async function processEntries(entries, models, facebookService, getReply) {
    const { Page, Conversation, Message, ensureDbSync } = models;
    await ensureDbSync();

    for (const entry of entries) {
        const pageId = entry.id;
        if (!entry.messaging) continue;

        for (const event of entry.messaging) {
            if (!event.message || !event.message.text || event.message.is_echo) continue;

            const senderId = event.sender.id;
            const messageText = event.message.text;

            console.log(`📨 Message from ${senderId} on page ${pageId}: "${messageText}"`);
            await handleIncomingMessage(pageId, senderId, messageText, models, facebookService, getReply);
        }
    }
}

async function handleIncomingMessage(fbPageId, senderId, messageText, models, facebookService, getReply) {
    const { Page, Conversation, Message } = models;

    try {
        const page = await Page.findOne({ where: { pageId: fbPageId } });
        if (!page) {
            console.log(`⚠️ Received message for unconnected page: ${fbPageId}`);
            return;
        }
        if (!page.isActive) {
            console.log(`⏸️ Auto-reply disabled for page: ${page.name}`);
            return;
        }

        let conversation = await Conversation.findOne({
            where: { senderId, pageId: page.id },
        });

        if (!conversation) {
            const senderProfile = await facebookService.getSenderProfile(senderId, page.accessToken);
            conversation = await Conversation.create({
                senderId,
                senderName: senderProfile.name,
                pageId: page.id,
            });
            console.log(`🆕 New conversation with ${senderProfile.name}`);
        }

        await Message.create({
            conversationId: conversation.id,
            role: 'user',
            content: messageText,
        });

        const history = await Message.findAll({
            where: { conversationId: conversation.id },
            order: [['createdAt', 'ASC']],
            limit: 20,
            attributes: ['role', 'content'],
        });

        const conversationHistory = history
            .slice(0, -1)
            .map((m) => ({ role: m.role, content: m.content }));

        console.log(`🤖 Calling Gemini AI for conversation with ${conversation.senderName}...`);
        const aiReply = await getReply(
            page.systemPrompt,
            page.context,
            conversationHistory,
            messageText
        );

        await Message.create({
            conversationId: conversation.id,
            role: 'assistant',
            content: aiReply,
        });

        await facebookService.sendMessage(page.accessToken, senderId, aiReply);
        console.log(`✅ Reply sent to ${conversation.senderName}: "${aiReply.substring(0, 100)}..."`);

        conversation.changed('updatedAt', true);
        await conversation.save();
    } catch (error) {
        console.error('Handle message error:', error.message);
        try {
            const page = await Page.findOne({ where: { pageId: fbPageId } });
            if (page) {
                await facebookService.sendMessage(
                    page.accessToken,
                    senderId,
                    "I'm sorry, I'm having trouble right now. Please try again in a moment."
                );
            }
        } catch (sendError) {
            console.error('Failed to send error message:', sendError.message);
        }
    }
}
