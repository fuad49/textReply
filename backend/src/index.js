require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

// Import models to register them and their associations
require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const pageRoutes = require('./routes/pages');
const webhookRoutes = require('./routes/webhook');

const app = express();
const PORT = process.env.PORT || 4000;

// Trust proxy (required for ngrok — so Express sees https:// not http://)
app.set('trust proxy', true);

// ─── Middleware ────────────────────────────────────────────
app.use(cors({
    origin: true, // Accept requests from any origin (ngrok, localhost, etc.)
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        name: 'TextReply API',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
    });
});

// ─── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/pages', pageRoutes);
app.use('/webhook', webhookRoutes);

// ─── Error Handler ────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────
async function start() {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ PostgreSQL connected successfully');

        // Sync models (creates tables if they don't exist)
        await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
        console.log('✅ Database models synced');

        app.listen(PORT, () => {
            console.log(`
╔══════════════════════════════════════════════╗
║          TextReply API Server                ║
║──────────────────────────────────────────────║
║  🚀 Server:    http://localhost:${PORT}         ║
║  📡 Webhook:   http://localhost:${PORT}/webhook  ║
║  🔑 Auth:      http://localhost:${PORT}/api/auth ║
║  📄 Pages:     http://localhost:${PORT}/api/pages║
╚══════════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

start();
