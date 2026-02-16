# ▲ Deploy TextReply to Vercel (Free)

Everything runs as a single Next.js app — no separate backend needed!

---

## Step 1: Push Code to GitHub

Open terminal in `d:\Antigravity\TextReply`:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/TextReply.git
git push -u origin main
```

---

## Step 2: Deploy on Vercel

1. Go to https://vercel.com → Sign up with **GitHub**
2. Click **"Add New Project"**
3. Import your **TextReply** repo
4. Set **Root Directory** to `frontend`
5. Vercel auto-detects Next.js — leave framework as **Next.js**
6. Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Supabase connection string |
| `FB_APP_ID` | Your Facebook App ID |
| `FB_APP_SECRET` | Your Facebook App Secret |
| `FB_VERIFY_TOKEN` | Your webhook verify token |
| `GEMINI_API_KEY` | Your Gemini API key |
| `JWT_SECRET` | Any random long string |
| `FRONTEND_URL` | `https://your-project.vercel.app` (fill after deploy) |
| `NEXT_PUBLIC_FB_APP_ID` | Same as FB_APP_ID |

7. Click **"Deploy"**
8. Wait ~2 minutes
9. You'll get a URL like: **`https://textreply.vercel.app`**

---

## Step 3: Set FRONTEND_URL

1. Go to your project on Vercel → **Settings** → **Environment Variables**
2. Set `FRONTEND_URL` to your Vercel URL (e.g., `https://textreply.vercel.app`)
3. Click **Save**
4. Go to **Deployments** → click the 3 dots on the latest → **Redeploy**

---

## Step 4: Update Facebook App Settings

Go to https://developers.facebook.com → Your App:

1. **Facebook Login → Settings → Valid OAuth Redirect URIs:**
   ```
   https://textreply.vercel.app/api/auth/facebook/callback
   ```

2. **Messenger → Settings → Webhooks → Edit Callback URL:**
   - **Callback URL**: `https://textreply.vercel.app/api/webhook`
   - **Verify Token**: same as your `FB_VERIFY_TOKEN`

3. Click **"Verify and Save"**

---

## Step 5: Test It! 🎉

1. Open your Vercel URL
2. Click **"Continue with Facebook"**
3. Connect your Page
4. Have someone message your Facebook Page
5. AI should auto-reply!

---

## 🔄 Deploying Updates

Just push to GitHub — Vercel auto-deploys!

```bash
git add .
git commit -m "Your update"
git push
```

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Check Vercel build logs, make sure Root Directory is `frontend` |
| Facebook login fails | Verify the OAuth redirect URI matches your Vercel URL exactly |
| Webhook not working | Check that callback URL is `https://YOUR_URL/api/webhook` |
| Database error | Check DATABASE_URL env var in Vercel settings |
| Slow first response | Normal on Vercel free tier (cold start ~3s) |
