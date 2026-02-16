#!/bin/bash
# ============================================
# TextReply VPS Deploy Script
# Run this on your VPS after cloning the repo
# Usage: bash deploy.sh
# ============================================

set -e

echo "🚀 Deploying TextReply..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --production
cd ..

# Install frontend dependencies & build
echo "📦 Installing frontend dependencies & building..."
cd frontend
npm install
npx next build
cd ..

# Create logs directory
mkdir -p logs

# Restart with PM2
echo "🔄 Restarting PM2 processes..."
pm2 restart ecosystem.config.json --update-env || pm2 start ecosystem.config.json

# Save PM2 config (so it auto-starts on reboot)
pm2 save

echo ""
echo "✅ Deployment complete!"
echo "   Backend:  http://localhost:4000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "📊 Check status: pm2 status"
echo "📋 View logs:    pm2 logs"
