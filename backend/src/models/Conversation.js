const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversation = sequelize.define('Conversation', {
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
        allowNull: true,
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

module.exports = Conversation;
