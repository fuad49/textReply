const express = require('express');
const { authenticate } = require('../middleware/auth');
const { Page, Conversation, Message } = require('../models');
const facebookService = require('../services/facebook');

const router = express.Router();

// All routes here require authentication
router.use(authenticate);

/**
 * GET /api/pages
 * List Facebook Pages the user can manage (from Graph API)
 */
router.get('/', async (req, res) => {
    try {
        // Fetch pages from Facebook
        const fbPages = await facebookService.getUserPages(req.user.accessToken);

        // Get already-connected page IDs
        const connectedPages = await Page.findAll({
            where: { userId: req.user.id },
            attributes: ['pageId'],
        });
        const connectedPageIds = new Set(connectedPages.map((p) => p.pageId));

        // Merge connection status
        const pages = fbPages.map((p) => ({
            pageId: p.id,
            name: p.name,
            picture: p.picture?.data?.url || null,
            fanCount: p.fan_count || 0,
            category: p.category || 'N/A',
            isConnected: connectedPageIds.has(p.id),
        }));

        res.json({ pages });
    } catch (error) {
        console.error('List pages error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch pages' });
    }
});

/**
 * GET /api/pages/connected
 * List pages that are already connected to TextReply
 */
router.get('/connected', async (req, res) => {
    try {
        const pages = await Page.findAll({
            where: { userId: req.user.id },
            include: [{
                model: Conversation,
                as: 'conversations',
                attributes: ['id'],
            }],
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

        res.json({ pages: result });
    } catch (error) {
        console.error('Connected pages error:', error.message);
        res.status(500).json({ error: 'Failed to fetch connected pages' });
    }
});

/**
 * POST /api/pages/connect
 * Connect a Facebook Page: subscribe webhooks and save to DB
 */
router.post('/connect', async (req, res) => {
    try {
        const { pageId } = req.body;

        if (!pageId) {
            return res.status(400).json({ error: 'pageId is required' });
        }

        // Get the page access token from Facebook
        const fbPages = await facebookService.getUserPages(req.user.accessToken);
        const fbPage = fbPages.find((p) => p.id === pageId);

        if (!fbPage) {
            return res.status(404).json({ error: 'Page not found or you do not have access' });
        }

        // Check if already connected
        const existing = await Page.findOne({ where: { pageId } });
        if (existing) {
            return res.status(409).json({ error: 'Page is already connected' });
        }

        // Subscribe the page to webhooks
        await facebookService.subscribePageWebhook(pageId, fbPage.access_token);

        // Save to database
        const page = await Page.create({
            pageId: fbPage.id,
            name: fbPage.name,
            accessToken: fbPage.access_token,
            userId: req.user.id,
        });

        console.log(`✅ Page connected: ${fbPage.name} (${fbPage.id})`);

        res.json({
            message: 'Page connected successfully!',
            page: {
                id: page.id,
                pageId: page.pageId,
                name: page.name,
                isActive: page.isActive,
            },
        });
    } catch (error) {
        console.error('Connect page error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to connect page' });
    }
});

/**
 * PUT /api/pages/:id/context
 * Update the AI system prompt/context for a connected page
 */
router.put('/:id/context', async (req, res) => {
    try {
        const { systemPrompt, context } = req.body;
        const page = await Page.findOne({
            where: { id: req.params.id, userId: req.user.id },
        });

        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }

        if (systemPrompt !== undefined) page.systemPrompt = systemPrompt;
        if (context !== undefined) page.context = context;
        await page.save();

        res.json({
            message: 'Settings updated successfully',
            systemPrompt: page.systemPrompt,
            context: page.context,
        });
    } catch (error) {
        console.error('Update context error:', error.message);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

/**
 * PUT /api/pages/:id/toggle
 * Toggle auto-reply on/off for a connected page
 */
router.put('/:id/toggle', async (req, res) => {
    try {
        const page = await Page.findOne({
            where: { id: req.params.id, userId: req.user.id },
        });

        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }

        page.isActive = !page.isActive;
        await page.save();

        res.json({ message: `Auto-reply ${page.isActive ? 'enabled' : 'disabled'}`, isActive: page.isActive });
    } catch (error) {
        console.error('Toggle error:', error.message);
        res.status(500).json({ error: 'Failed to toggle page' });
    }
});

/**
 * GET /api/pages/:id/conversations
 * List conversations for a specific connected page
 */
router.get('/:id/conversations', async (req, res) => {
    try {
        const page = await Page.findOne({
            where: { id: req.params.id, userId: req.user.id },
        });

        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }

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

        res.json({ conversations: result });
    } catch (error) {
        console.error('Conversations error:', error.message);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

/**
 * GET /api/pages/:pageId/conversations/:conversationId/messages
 * Get all messages in a conversation
 */
router.get('/:pageId/conversations/:conversationId/messages', async (req, res) => {
    try {
        const page = await Page.findOne({
            where: { id: req.params.pageId, userId: req.user.id },
        });

        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }

        const messages = await Message.findAll({
            where: { conversationId: req.params.conversationId },
            order: [['createdAt', 'ASC']],
        });

        res.json({ messages });
    } catch (error) {
        console.error('Messages error:', error.message);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

/**
 * DELETE /api/pages/:id
 * Disconnect a page
 */
router.delete('/:id', async (req, res) => {
    try {
        const page = await Page.findOne({
            where: { id: req.params.id, userId: req.user.id },
        });

        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }

        await page.destroy();
        res.json({ message: 'Page disconnected successfully' });
    } catch (error) {
        console.error('Delete page error:', error.message);
        res.status(500).json({ error: 'Failed to disconnect page' });
    }
});

module.exports = router;
