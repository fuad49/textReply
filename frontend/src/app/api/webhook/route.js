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

    if (!mode) {
        return NextResponse.json({ status: 'Webhook endpoint is running' });
    }

    console.error('❌ Webhook verification failed.');
    return new Response('Forbidden', { status: 403 });
}

// POST /api/webhook — receive messages from Facebook
export async function POST(request) {
    const body = await request.json();

    if (body.object !== 'page') {
        return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    // Process messages (don't await — respond to Facebook quickly)
    processEntries(body.entry).catch((err) =>
        console.error('Webhook processing error:', err)
    );

    return NextResponse.json({ status: 'ok' }, { status: 200 });
}

async function processEntries(entries) {
    const { getPageByPageId, findOrCreateConversation, createMessage, getRecentMessages, updateConversationTimestamp } = await import('@/lib/models');
    const facebookService = await import('@/lib/facebook');
    const { getReply } = await import('@/lib/gemini');

    for (const entry of entries) {
        const fbPageId = entry.id;
        if (!entry.messaging) continue;

        for (const event of entry.messaging) {
            if (!event.message || !event.message.text || event.message.is_echo) continue;

            const senderId = event.sender.id;
            const messageText = event.message.text;

            console.log(`📨 Message from ${senderId} on page ${fbPageId}: "${messageText}"`);
            await handleIncomingMessage(fbPageId, senderId, messageText, { getPageByPageId, findOrCreateConversation, createMessage, getRecentMessages, updateConversationTimestamp }, facebookService, getReply);
        }
    }
}

async function handleIncomingMessage(fbPageId, senderId, messageText, models, facebookServiceModule, getReply) {
    const { getPageByPageId, findOrCreateConversation, createMessage, getRecentMessages, updateConversationTimestamp } = models;

    try {
        const page = await getPageByPageId(fbPageId);
        if (!page) {
            console.log(`⚠️ Received message for unconnected page: ${fbPageId}`);
            return;
        }
        if (!page.isActive) {
            console.log(`⏸️ Auto-reply disabled for page: ${page.name}`);
            return;
        }

        const senderProfile = await facebookServiceModule.getSenderProfile(senderId, page.accessToken);
        const conversation = await findOrCreateConversation(senderId, page.id, senderProfile.name);

        await createMessage(conversation.id, 'user', messageText);

        const history = await getRecentMessages(conversation.id, 20);
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

        await createMessage(conversation.id, 'assistant', aiReply);
        await facebookServiceModule.sendMessage(page.accessToken, senderId, aiReply);
        console.log(`✅ Reply sent to ${conversation.senderName}: "${aiReply.substring(0, 100)}..."`);

        await updateConversationTimestamp(conversation.id);
    } catch (error) {
        console.error('Handle message error:', error.message);
        console.error('Error stack:', error.stack);
        try {
            const page = await getPageByPageId(fbPageId);
            if (page) {
                await facebookServiceModule.sendMessage(
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
