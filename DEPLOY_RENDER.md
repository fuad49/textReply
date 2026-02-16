# 🚀 Deploy TextReply to Render.com (Free)

No servers to manage. Render deploys from GitHub automatically.

---

## Step 1: Push Code to GitHub

On your Windows PC, open terminal in `d:\Antigravity\TextReply`:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/TextReply.git
git push -u origin main
```

> If you already did this, just push the latest:
> ```bash
> git add . && git commit -m "Add Render config" && git push
> ```

---

## Step 2: Create a Render Account

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (easiest — it connects your repos automatically)

---

## Step 3: Deploy the Backend

1. On Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your **TextReply** GitHub repo
3. Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `textreply-backend` |
| **Region** | Singapore (or closest to you) |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node src/index.js` |
| **Plan** | Free |

4. Click **"Environment"** tab (or scroll down) → **"Add Environment Variable"**
5. Add these one by one:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `DATABASE_URL` | Your Supabase connection string |
| `FB_APP_ID` | Your Facebook App ID |
| `FB_APP_SECRET` | Your Facebook App Secret |
| `FB_VERIFY_TOKEN` | Your webhook verify token |
| `GEMINI_API_KEY` | Your Gemini API key |
| `JWT_SECRET` | Any random long string |
| `FRONTEND_URL` | Leave blank for now (you'll fill this after Step 4) |

6. Click **"Deploy Web Service"**
7. Wait ~2 minutes for it to deploy
8. You'll get a URL like: **`https://textreply-backend-xxxx.onrender.com`**

**Copy this URL** — you need it for Step 4.

---

## Step 4: Deploy the Frontend

1. Click **"New +"** → **"Web Service"** again
2. Connect the same **TextReply** repo
3. Fill in:

| Setting | Value |
|---------|-------|
| **Name** | `textreply-frontend` |
| **Region** | Same as backend |
| **Root Directory** | `frontend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npx next build` |
| **Start Command** | `npx next start -p $PORT` |
| **Plan** | Free |

4. Add environment variables:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://textreply-backend-xxxx.onrender.com` (from Step 3) |
| `NEXT_PUBLIC_FB_APP_ID` | Your Facebook App ID |

5. Click **"Deploy Web Service"**
6. Wait ~3 minutes
7. You'll get a URL like: **`https://textreply-frontend-xxxx.onrender.com`**

---

## Step 5: Link Frontend URL Back to Backend

1. Go to your **backend** service on Render
2. Click **"Environment"** tab
3. Set `FRONTEND_URL` to your frontend URL:
   ```
   https://textreply-frontend-xxxx.onrender.com
   ```
4. Click **"Save Changes"** → the backend will auto-redeploy

---

## Step 6: Update Facebook App Settings

Go to https://developers.facebook.com → Your App:

1. **Facebook Login → Settings → Valid OAuth Redirect URIs:**
   ```
   https://textreply-backend-xxxx.onrender.com/api/auth/facebook/callback
   ```

2. **Messenger → Settings → Webhooks → Edit Callback URL:**
   - **Callback URL**: `https://textreply-backend-xxxx.onrender.com/webhook`
   - **Verify Token**: same as your `FB_VERIFY_TOKEN`

3. Click **"Verify and Save"**

---

## Step 7: Test It! 🎉

1. Open your frontend URL: `https://textreply-frontend-xxxx.onrender.com`
2. Click **"Continue with Facebook"**
3. Connect your Page
4. Have someone message your Facebook Page
5. AI should auto-reply!

---

## 🔄 Deploying Updates

After pushing code changes to GitHub:
- Render **auto-deploys** — just push and wait ~2 minutes!

```bash
git add .
git commit -m "Your update message"
git push
```

---

## ⚠️ Free Tier Limitations

| Limitation | What happens |
|-----------|-------------|
| **Spin down after 15 min idle** | First request after idle takes ~30 seconds to wake up |
| **750 hours/month** | Plenty for 1 backend + 1 frontend (24/7 = 720 hours) |

> The free tier spins down after 15 minutes of no traffic. This means Facebook webhook messages might fail if no one has used the app recently. To prevent this, you can use a free "keep alive" service like https://uptimerobot.com to ping your backend URL every 14 minutes.

### Set Up UptimeRobot (Optional — Keeps App Alive)
1. Go to https://uptimerobot.com → Sign up (free)
2. Click **"Add New Monitor"**
3. Type: **HTTP(s)**
4. URL: `https://textreply-backend-xxxx.onrender.com/`
5. Interval: **5 minutes**
6. Create Monitor

This pings your backend every 5 minutes so it never sleeps! 🚀

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Check Render logs, make sure Root Directory is set correctly |
| "502 Bad Gateway" | App is starting up — wait 30 seconds and try again |
| Facebook login not working | Check that OAuth redirect URI matches your Render backend URL |
| Webhook not working | Make sure backend is awake (check UptimeRobot) |
| Environment variable changes | Render auto-redeploys when you change env vars |
