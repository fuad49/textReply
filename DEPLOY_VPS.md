# 🖥️ VPS Deployment Guide

Deploy TextReply to a VPS (DigitalOcean, Hetzner, Vultr, etc.) using GitHub.

---

## What You'll Need

- A **VPS** with Ubuntu (any provider — $5/month is enough)
- A **domain name** pointing to your VPS IP (optional but recommended)
- Your code pushed to **GitHub**

---

## Step 1: Push Code to GitHub

On your **Windows PC**, open terminal in `d:\Antigravity\TextReply`:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/TextReply.git
git push -u origin main
```

> ⚠️ Your `.env` and `.env.local` files are in `.gitignore` — they won't be pushed (this is correct, secrets should never be on GitHub).

---

## Step 2: Set Up the VPS

SSH into your VPS:
```bash
ssh root@YOUR_VPS_IP
```

Install everything needed:
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 (keeps your app running forever)
npm install -g pm2

# Install nginx (routes traffic to your app)
apt install -y nginx

# Install git
apt install -y git
```

---

## Step 3: Clone Your Repo

```bash
cd /home
git clone https://github.com/YOUR_USERNAME/TextReply.git
cd TextReply
```

---

## Step 4: Create .env Files on the VPS

Create backend environment file:
```bash
nano backend/.env
```

Paste this (with your real values):
```env
PORT=4000
NODE_ENV=production
DATABASE_URL=postgresql://postgres.fejxbeejxcgesozqlpty:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
FB_APP_ID=your_fb_app_id
FB_APP_SECRET=your_fb_app_secret
FB_VERIFY_TOKEN=your_verify_token
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://yourdomain.com
```

Save: `Ctrl+O` → `Enter` → `Ctrl+X`

Create frontend environment file:
```bash
nano frontend/.env.local
```

Paste:
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com
NEXT_PUBLIC_FB_APP_ID=your_fb_app_id
```

Save: `Ctrl+O` → `Enter` → `Ctrl+X`

> ⚠️ Replace `yourdomain.com` with your actual domain. If you don't have a domain, use `http://YOUR_VPS_IP` instead.

---

## Step 5: Install, Build & Start

```bash
# Install dependencies
cd /home/TextReply
npm run setup

# Build the frontend for production
cd frontend
npx next build
cd ..

# Start both servers with PM2
pm2 start ecosystem.config.json

# Make PM2 restart on server reboot
pm2 startup
pm2 save
```

Check everything is running:
```bash
pm2 status
```

You should see:
```
┌─────────────────────┬────┬─────────┬──────┐
│ Name                │ id │ status  │ cpu  │
├─────────────────────┼────┼─────────┼──────┤
│ textreply-backend   │ 0  │ online  │ 0%   │
│ textreply-frontend  │ 1  │ online  │ 0%   │
└─────────────────────┴────┴─────────┴──────┘
```

---

## Step 6: Set Up Nginx

### Option A: With a Domain (Recommended)

First, point your domain's **A record** to your VPS IP address (in your domain registrar's DNS settings).

Copy the nginx config:
```bash
cp /home/TextReply/nginx.conf /etc/nginx/sites-available/textreply
```

Edit it with your actual domain:
```bash
nano /etc/nginx/sites-available/textreply
```
Replace all `yourdomain.com` with your real domain.

Enable the site:
```bash
ln -s /etc/nginx/sites-available/textreply /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

Get free SSL certificate:
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

Follow the prompts → Certbot will automatically configure SSL.

### Option B: Without a Domain (IP Only)

```bash
nano /etc/nginx/sites-available/textreply
```

Paste this simpler config:
```nginx
server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /webhook {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it:
```bash
ln -s /etc/nginx/sites-available/textreply /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

---

## Step 7: Update Facebook App Settings

Go to https://developers.facebook.com → Your App and update:

1. **Facebook Login → Settings → Valid OAuth Redirect URIs:**
   ```
   https://yourdomain.com/api/auth/facebook/callback
   ```
   (or `http://YOUR_VPS_IP/api/auth/facebook/callback` if no domain)

2. **Messenger → Settings → Webhooks → Edit Callback URL:**
   ```
   https://yourdomain.com/webhook
   ```

---

## Step 8: Test It!

Open `https://yourdomain.com` (or `http://YOUR_VPS_IP`) in your browser — you should see the TextReply login page!

---

## 🔄 Deploying Updates

After pushing new code to GitHub:
```bash
ssh root@YOUR_VPS_IP
cd /home/TextReply
bash deploy.sh
```

Or just run manually:
```bash
git pull origin main
cd frontend && npx next build && cd ..
pm2 restart all
```

---

## Useful PM2 Commands

| Command | What it does |
|---------|-------------|
| `pm2 status` | See running processes |
| `pm2 logs` | View live logs |
| `pm2 logs textreply-backend` | Backend logs only |
| `pm2 restart all` | Restart everything |
| `pm2 stop all` | Stop everything |
| `pm2 monit` | Live monitoring dashboard |

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| pm2 shows "errored" | Run `pm2 logs` to see the error |
| "502 Bad Gateway" | Backend isn't running — check `pm2 status` |
| Can't access the site | Check firewall: `ufw allow 80` and `ufw allow 443` |
| Domain not working | Make sure DNS A record points to your VPS IP |
| SSL certificate error | Run `certbot --nginx -d yourdomain.com` again |
