import postgres from 'postgres';

let sql;

export function getDb() {
    if (!sql) {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL environment variable is not set');
        }
        sql = postgres(process.env.DATABASE_URL, {
            ssl: 'require',
            idle_timeout: 20, // close idle connections after 20 seconds
            max_lifetime: 60 * 30, // 30 minutes max connection lifetime
            connect_timeout: 10,
        });
    }
    return sql;
}

// Initialize tables if they don't exist
// Using camelCase column names to match existing Sequelize schema
export async function ensureTablesExist() {
    const sql = getDb();

    await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "facebookId" VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      "accessToken" TEXT NOT NULL,
      "profilePicture" TEXT,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `;

    await sql`
    CREATE TABLE IF NOT EXISTS pages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "pageId" VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      "accessToken" TEXT NOT NULL,
      "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      "isActive" BOOLEAN DEFAULT true,
      "systemPrompt" TEXT DEFAULT 'You are a helpful customer support assistant for this Facebook Page. Be friendly, concise, and helpful. If you don''t know something, politely say so and offer to help in another way.',
      context TEXT DEFAULT '',
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `;

    await sql`
    CREATE TABLE IF NOT EXISTS conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "senderId" VARCHAR(255) NOT NULL,
      "senderName" VARCHAR(255) DEFAULT 'Unknown User',
      "pageId" UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `;

    await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "conversationId" UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      "createdAt" TIMESTAMP DEFAULT NOW()
    )
  `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS "idx_pages_userId" ON pages("userId")`;
    await sql`CREATE INDEX IF NOT EXISTS "idx_conversations_pageId" ON conversations("pageId")`;
    await sql`CREATE INDEX IF NOT EXISTS "idx_messages_conversationId" ON messages("conversationId")`;
}
