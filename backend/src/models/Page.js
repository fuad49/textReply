const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Page = sequelize.define('Page', {
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

module.exports = Page;
