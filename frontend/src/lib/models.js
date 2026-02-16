import { getDb, ensureTablesExist } from './database';

// ────────────────────────────────────────────────────────
// USER OPERATIONS
// ────────────────────────────────────────────────────────

export async function findOrCreateUser(facebookId, userData) {
    const sql = getDb();
    await ensureTablesExist();

    // Try to find existing user
    const existing = await sql`
    SELECT * FROM users WHERE facebook_id = ${facebookId}
  `;

    if (existing.length > 0) {
        return existing[0];
    }

    // Create new user
    const [user] = await sql`
    INSERT INTO users (facebook_id, name, email, access_token, profile_picture)
    VALUES (${facebookId}, ${userData.name}, ${userData.email}, ${userData.accessToken}, ${userData.profilePicture})
    RETURNING *
  `;

    return user;
}

export async function updateUser(userId, updates) {
    const sql = getDb();
    const [user] = await sql`
    UPDATE users
    SET
      name = COALESCE(${updates.name}, name),
      access_token = COALESCE(${updates.accessToken}, access_token),
      profile_picture = COALESCE(${updates.profilePicture}, profile_picture),
      updated_at = NOW()
    WHERE id = ${userId}
    RETURNING *
  `;
    return user;
}

export async function getUserById(userId) {
    const sql = getDb();
    const [user] = await sql`SELECT * FROM users WHERE id = ${userId}`;
    return user || null;
}

// ────────────────────────────────────────────────────────
// PAGE OPERATIONS
// ────────────────────────────────────────────────────────

export async function getConnectedPages(userId) {
    const sql = getDb();
    await ensureTablesExist();

    const pages = await sql`
    SELECT 
      p.*,
      COUNT(DISTINCT c.id) as conversation_count
    FROM pages p
    LEFT JOIN conversations c ON c.page_id = p.id
    WHERE p.user_id = ${userId}
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;

    return pages;
}

export async function getPageByPageId(pageId) {
    const sql = getDb();
    const [page] = await sql`SELECT * FROM pages WHERE page_id = ${pageId}`;
    return page || null;
}

export async function getPageById(id, userId) {
    const sql = getDb();
    const [page] = await sql`SELECT * FROM pages WHERE id = ${id} AND user_id = ${userId}`;
    return page || null;
}

export async function createPage(pageData) {
    const sql = getDb();
    await ensureTablesExist();

    const [page] = await sql`
    INSERT INTO pages (page_id, name, access_token, user_id)
    VALUES (${pageData.pageId}, ${pageData.name}, ${pageData.accessToken}, ${pageData.userId})
    RETURNING *
  `;

    return page;
}

export async function updatePageSettings(pageId, userId, updates) {
    const sql = getDb();
    const [page] = await sql`
    UPDATE pages
    SET
      system_prompt = COALESCE(${updates.systemPrompt}, system_prompt),
      context = COALESCE(${updates.context}, context),
      updated_at = NOW()
    WHERE id = ${pageId} AND user_id = ${userId}
    RETURNING *
  `;
    return page || null;
}

export async function togglePage(pageId, userId) {
    const sql = getDb();
    const [page] = await sql`
    UPDATE pages
    SET is_active = NOT is_active, updated_at = NOW()
    WHERE id = ${pageId} AND user_id = ${userId}
    RETURNING *
  `;
    return page || null;
}

export async function deletePage(pageId, userId) {
    const sql = getDb();
    await sql`DELETE FROM pages WHERE id = ${pageId} AND user_id = ${userId}`;
}

// ────────────────────────────────────────────────────────
// CONVERSATION OPERATIONS
// ────────────────────────────────────────────────────────

export async function findOrCreateConversation(senderId, pageId, senderName = 'Unknown User') {
    const sql = getDb();
    await ensureTablesExist();

    const existing = await sql`
    SELECT * FROM conversations WHERE sender_id = ${senderId} AND page_id = ${pageId}
  `;

    if (existing.length > 0) {
        return existing[0];
    }

    const [conversation] = await sql`
    INSERT INTO conversations (sender_id, sender_name, page_id)
    VALUES (${senderId}, ${senderName}, ${pageId})
    RETURNING *
  `;

    return conversation;
}

export async function getConversations(pageId) {
    const sql = getDb();

    const conversations = await sql`
    SELECT
      c.*,
      m.content as last_message,
      m.created_at as last_message_at
    FROM conversations c
    LEFT JOIN LATERAL (
      SELECT content, created_at
      FROM messages
      WHERE conversation_id = c.id
      ORDER BY created_at DESC
      LIMIT 1
    ) m ON true
    WHERE c.page_id = ${pageId}
    ORDER BY c.updated_at DESC
  `;

    return conversations;
}

export async function updateConversationTimestamp(conversationId) {
    const sql = getDb();
    await sql`UPDATE conversations SET updated_at = NOW() WHERE id = ${conversationId}`;
}

// ────────────────────────────────────────────────────────
// MESSAGE OPERATIONS
// ────────────────────────────────────────────────────────

export async function createMessage(conversationId, role, content) {
    const sql = getDb();
    await ensureTablesExist();

    const [message] = await sql`
    INSERT INTO messages (conversation_id, role, content)
    VALUES (${conversationId}, ${role}, ${content})
    RETURNING *
  `;

    return message;
}

export async function getMessages(conversationId, limit = 20) {
    const sql = getDb();

    const messages = await sql`
    SELECT * FROM messages
    WHERE conversation_id = ${conversationId}
    ORDER BY created_at ASC
    LIMIT ${limit}
  `;

    return messages;
}

export async function getRecentMessages(conversationId, limit = 20) {
    const sql = getDb();

    const messages = await sql`
    SELECT role, content FROM messages
    WHERE conversation_id = ${conversationId}
    ORDER BY created_at ASC
    LIMIT ${limit}
  `;

    return messages;
}
