const express = require('express');
const { Page, Conversation, Message } = require('../models');
const facebookService = require('../services/facebook');
const geminiService = require('../services/gemini');

const router = express.Router();

/**
 * GET /webhook
 * Facebook Webhook Verification
 * Facebook sends a GET request with hub.mode, hub.verify_token, and hub.challenge
 */
router.get('/', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.FB_VERIFY_TOKEN) {
        console.log('✅ Webhook verified successfully!');
        return res.status(200).send(challenge);
    }

    console.error('❌ Webhook verification failed. Token mismatch.');
    return res.sendStatus(403);
});

/**
 * POST /webhook
 * Receive incoming messages from Facebook Messenger
 * Pipeline: receive message → find page → find/create conversation → get context → call Gemini → reply
 */
router.post('/', async (req, res) => {
    // Facebook requires a 200 response within 20 seconds
    // Respond immediately, then process asynchronously
    res.sendStatus(200);

    try {
        const body = req.body;

        if (body.object !== 'page') {
            return;
        }

        for (const entry of body.entry) {
            const pageId = entry.id;

            if (!entry.messaging) continue;

            for (const event of entry.messaging) {
                // Only process text messages (ignore read receipts, deliveries, etc.)
                if (!event.message || !event.message.text || event.message.is_echo) {
                    continue;
                }

                const senderId = event.sender.id;
                const messageText = event.message.text;

                console.log(`📨 Message from ${senderId} on page ${pageId}: "${messageText}"`);

                // Process the message
                await handleIncomingMessage(pageId, senderId, messageText);
            }
        }
    } catch (error) {
        console.error('Webhook processing error:', error);
    }
});

/**
 * Handle an incoming message:
 * 1. Find the connected page in our DB
 * 2. Find or create a conversation thread
 * 3. Store the user message
 * 4. Get conversation history for context
 * 5. Call Gemini AI with context + message
 * 6. Store the AI reply
 * 7. Send the reply back via Facebook
 */
async function handleIncomingMessage(fbPageId, senderId, messageText) {
    try {
        // 1. Find the connected page
        const page = await Page.findOne({ where: { pageId: fbPageId } });

        if (!page) {
            console.log(`⚠️ Received message for unconnected page: ${fbPageId}`);
            return;
        }

        if (!page.isActive) {
            console.log(`⏸️ Auto-reply disabled for page: ${page.name}`);
            return;
        }

        // 2. Find or create conversation
        let conversation = await Conversation.findOne({
            where: { senderId, pageId: page.id },
        });

        if (!conversation) {
            // Try to get sender's name from Facebook
            const senderProfile = await facebookService.getSenderProfile(senderId, page.accessToken);

            conversation = await Conversation.create({
                senderId,
                senderName: senderProfile.name,
                pageId: page.id,
            });

            console.log(`🆕 New conversation with ${senderProfile.name}`);
        }

        // 3. Store the incoming user message
        await Message.create({
            conversationId: conversation.id,
            role: 'user',
            content: messageText,
        });

        // 4. Get conversation history (last 20 messages for context)
        const history = await Message.findAll({
            where: { conversationId: conversation.id },
            order: [['createdAt', 'ASC']],
            limit: 20,
            attributes: ['role', 'content'],
        });

        // Convert to plain objects (exclude the last message since we pass it separately)
        const conversationHistory = history
            .slice(0, -1) // Remove the just-added user message
            .map((m) => ({ role: m.role, content: m.content }));

        // 5. Call Gemini AI
        console.log(`🤖 Calling Gemini AI for conversation with ${conversation.senderName}...`);
        const aiReply = await geminiService.getReply(
            page.systemPrompt,
            page.context,
            conversationHistory,
            messageText
        );

        // 6. Store the AI reply
        await Message.create({
            conversationId: conversation.id,
            role: 'assistant',
            content: aiReply,
        });

        // 7. Send reply via Facebook
        await facebookService.sendMessage(page.accessToken, senderId, aiReply);

        console.log(`✅ Reply sent to ${conversation.senderName}: "${aiReply.substring(0, 100)}..."`);

        // Update conversation timestamp
        conversation.changed('updatedAt', true);
        await conversation.save();

    } catch (error) {
        console.error('Handle message error:', error.message);

        // Try to send an error message to the user
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

module.exports = router;
