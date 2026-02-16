import { getDb, ensureTablesExist } from './database';

// ────────────────────────────────────────────────────────
// USER OPERATIONS
// ────────────────────────────────────────────────────────

export async function findOrCreateUser(facebookId, userData) {
  const sql = getDb();
  await ensureTablesExist();

  // Try to find existing user
  const existing = await sql`
    SELECT * FROM users WHERE "facebookId" = ${facebookId}
  `;

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new user - generate UUID since DB might not have DEFAULT set
  const userId = crypto.randomUUID();
  const now = new Date();
  const [user] = await sql`
    INSERT INTO users (id, "facebookId", name, email, "accessToken", "profilePicture", "createdAt", "updatedAt")
    VALUES (${userId}, ${facebookId}, ${userData.name}, ${userData.email}, ${userData.accessToken}, ${userData.profilePicture}, ${now}, ${now})
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
      "accessToken" = COALESCE(${updates.accessToken}, "accessToken"),
      "profilePicture" = COALESCE(${updates.profilePicture}, "profilePicture"),
      "updatedAt" = NOW()
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
    LEFT JOIN conversations c ON c."pageId" = p.id
    WHERE p."userId" = ${userId}
    GROUP BY p.id
    ORDER BY p."createdAt" DESC
  `;

  return pages;
}

export async function getPageByPageId(pageId) {
  const sql = getDb();
  const [page] = await sql`SELECT * FROM pages WHERE "pageId" = ${pageId}`;
  return page || null;
}

export async function getPageById(id, userId) {
  const sql = getDb();
  const [page] = await sql`SELECT * FROM pages WHERE id = ${id} AND "userId" = ${userId}`;
  return page || null;
}

export async function createPage(pageData) {
  const sql = getDb();
  await ensureTablesExist();

  const pageId = crypto.randomUUID();
  const now = new Date();
  const [page] = await sql`
    INSERT INTO pages (id, "pageId", name, "accessToken", "userId", "createdAt", "updatedAt")
    VALUES (${pageId}, ${pageData.pageId}, ${pageData.name}, ${pageData.accessToken}, ${pageData.userId}, ${now}, ${now})
    RETURNING *
  `;

  return page;
}

export async function updatePageSettings(pageId, userId, updates) {
  const sql = getDb();
  const [page] = await sql`
    UPDATE pages
    SET
      "systemPrompt" = COALESCE(${updates.systemPrompt}, "systemPrompt"),
      context = COALESCE(${updates.context}, context),
      "updatedAt" = NOW()
    WHERE id = ${pageId} AND "userId" = ${userId}
    RETURNING *
  `;
  return page || null;
}

export async function togglePage(pageId, userId) {
  const sql = getDb();
  const [page] = await sql`
    UPDATE pages
    SET "isActive" = NOT "isActive", "updatedAt" = NOW()
    WHERE id = ${pageId} AND "userId" = ${userId}
    RETURNING *
  `;
  return page || null;
}

export async function deletePage(pageId, userId) {
  const sql = getDb();
  await sql`DELETE FROM pages WHERE id = ${pageId} AND "userId" = ${userId}`;
}

// ────────────────────────────────────────────────────────
// CONVERSATION OPERATIONS
// ────────────────────────────────────────────────────────

export async function findOrCreateConversation(senderId, pageId, senderName = 'Unknown User') {
  const sql = getDb();
  await ensureTablesExist();

  const existing = await sql`
    SELECT * FROM conversations WHERE "senderId" = ${senderId} AND "pageId" = ${pageId}
  `;

  if (existing.length > 0) {
    return existing[0];
  }

  const conversationId = crypto.randomUUID();
  const now = new Date();
  const [conversation] = await sql`
    INSERT INTO conversations (id, "senderId", "senderName", "pageId", "createdAt", "updatedAt")
    VALUES (${conversationId}, ${senderId}, ${senderName}, ${pageId}, ${now}, ${now})
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
      m."createdAt" as last_message_at
    FROM conversations c
    LEFT JOIN LATERAL (
      SELECT content, "createdAt"
      FROM messages
      WHERE "conversationId" = c.id
      ORDER BY "createdAt" DESC
      LIMIT 1
    ) m ON true
    WHERE c."pageId" = ${pageId}
    ORDER BY c."updatedAt" DESC
  `;

  return conversations;
}

export async function updateConversationTimestamp(conversationId) {
  const sql = getDb();
  await sql`UPDATE conversations SET "updatedAt" = NOW() WHERE id = ${conversationId}`;
}

// ────────────────────────────────────────────────────────
// MESSAGE OPERATIONS
// ────────────────────────────────────────────────────────

export async function createMessage(conversationId, role, content) {
  const sql = getDb();
  await ensureTablesExist();

  const messageId = crypto.randomUUID();
  const now = new Date();
  const [message] = await sql`
    INSERT INTO messages (id, "conversationId", role, content, "createdAt")
    VALUES (${messageId}, ${conversationId}, ${role}, ${content}, ${now})
    RETURNING *
  `;

  return message;
}

export async function getMessages(conversationId, limit = 20) {
  const sql = getDb();

  const messages = await sql`
    SELECT * FROM messages
    WHERE "conversationId" = ${conversationId}
    ORDER BY "createdAt" ASC
    LIMIT ${limit}
  `;

  return messages;
}

export async function getRecentMessages(conversationId, limit = 20) {
  const sql = getDb();

  const messages = await sql`
    SELECT role, content FROM messages
    WHERE "conversationId" = ${conversationId}
    ORDER BY "createdAt" ASC
    LIMIT ${limit}
  `;

  return messages;
}
