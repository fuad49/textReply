const User = require('./User');
const Page = require('./Page');
const Conversation = require('./Conversation');
const Message = require('./Message');

// Associations
User.hasMany(Page, { foreignKey: 'userId', as: 'pages' });
Page.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Page.hasMany(Conversation, { foreignKey: 'pageId', as: 'conversations' });
Conversation.belongsTo(Page, { foreignKey: 'pageId', as: 'page' });

Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

module.exports = { User, Page, Conversation, Message };
