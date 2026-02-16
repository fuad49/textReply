import { DataTypes } from 'sequelize';
import getSequelize from './database';

const sequelize = getSequelize();

// ─── User Model ──────────────────────────────────────────
export const User = sequelize.define('User', {
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
export const Page = sequelize.define('Page', {
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
export const Conversation = sequelize.define('Conversation', {
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
export const Message = sequelize.define('Message', {
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

// ─── Sync ────────────────────────────────────────────────
let synced = false;
export async function ensureDbSync() {
    if (!synced) {
        await sequelize.sync({ alter: true });
        synced = true;
    }
}
