import { DataTypes } from 'sequelize';
import getSequelize from './database';

let modelsInitialized = false;
let User, Page, Conversation, Message;

function initializeModels() {
    if (modelsInitialized) {
        return { User, Page, Conversation, Message };
    }

    const sequelize = getSequelize();

    // ─── User Model ──────────────────────────────────────────
    User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        facebookId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        accessToken: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        profilePicture: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        tableName: 'users',
        timestamps: true,
    });

    // ─── Page Model ──────────────────────────────────────────
    Page = sequelize.define('Page', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        pageId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        accessToken: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        systemPrompt: {
            type: DataTypes.TEXT,
            defaultValue: 'You are a helpful customer support assistant for this Facebook Page. Be friendly, concise, and helpful. If you don\'t know something, politely say so and offer to help in another way.',
        },
        context: {
            type: DataTypes.TEXT,
            defaultValue: '',
        },
    }, {
        tableName: 'pages',
        timestamps: true,
    });

    // ─── Conversation Model ─────────────────────────────────
    Conversation = sequelize.define('Conversation', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        senderId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        senderName: {
            type: DataTypes.STRING,
            defaultValue: 'Unknown User',
        },
        pageId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'pages',
                key: 'id',
            },
        },
    }, {
        tableName: 'conversations',
        timestamps: true,
    });

    // ─── Message Model ───────────────────────────────────────
    Message = sequelize.define('Message', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        conversationId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'conversations',
                key: 'id',
            },
        },
        role: {
            type: DataTypes.ENUM('user', 'assistant'),
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    }, {
        tableName: 'messages',
        timestamps: true,
    });

    // ─── Associations ────────────────────────────────────────
    User.hasMany(Page, { foreignKey: 'userId', as: 'pages' });
    Page.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Page.hasMany(Conversation, { foreignKey: 'pageId', as: 'conversations' });
    Conversation.belongsTo(Page, { foreignKey: 'pageId', as: 'page' });
    Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
    Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

    modelsInitialized = true;
    return { User, Page, Conversation, Message };
}

// ─── Sync ────────────────────────────────────────────────
let synced = false;
export async function ensureDbSync() {
    const models = initializeModels();
    if (!synced) {
        await getSequelize().sync({ alter: true });
        synced = true;
    }
    return models;
}

// Export lazy getters
export function getModels() {
    return initializeModels();
}

// For backwards compatibility - but these will initialize on access
export { User, Page, Conversation, Message };
