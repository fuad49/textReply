# Vercel Deployment Fix Checklist

## ✅ Code Fixes (Done)
- [x] Added `pg-native` override in `package.json` to prevent it from installing
- [x] Updated `next.config.mjs` to ignore `pg-native` in webpack
- [x] Created lazy-loading webhook handler to avoid DB init on GET requests

## 🔄 Steps You Need to Do Now

### 1. Push the Code Fixes
```bash
git add .
git commit -m "Fix pg-native bundling issue for Vercel"
git push
```
Wait for Vercel to auto-deploy (~2 minutes).

### 2. Verify Environment Variables on Vercel
Go to **Vercel Dashboard** → Your project → **Settings** → **Environment Variables**

Make sure ALL these are set:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_uKL1OeUA7Ryj@ep-broad-fire-a1cyj95a-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `FB_APP_ID` | `2999749156872583` |
| `FB_APP_SECRET` | `4b827250982bfda798f53e11548d4fe9` |
| `FB_VERIFY_TOKEN` | `Fuad2004Firoj` |
| `GEMINI_API_KEY` | `AIzaSyBpzxb6J_RZawUiK7ZBaiWZ67MLR3kPYdg` |
| `JWT_SECRET` | `your_super_secret_jwt_key_change_this` |
| `NEXT_PUBLIC_FB_APP_ID` | `2999749156872583` |
| `FRONTEND_URL` | `https://text-reply.vercel.app` |

If any are missing, add them and **Redeploy**.

### 3. Fix Facebook OAuth Settings

Go to **https://developers.facebook.com** → Your App → **Facebook Login** → **Settings**

**A. Enable Facebook Login:**
- Make sure **"Client OAuth Login"** is **ON**
- Make sure **"Web OAuth Login"** is **ON**

**B. Add Valid OAuth Redirect URIs:**
Add this exact URL:
```
https://text-reply.vercel.app/api/auth/facebook/callback
```
Click **Save Changes**.

### 4. Set Up Webhook on Facebook

Go to **Messenger** → **Settings** → **Webhooks**

**A. Edit Callback URL:**
- **Callback URL**: `https://text-reply.vercel.app/api/webhook`
- **Verify Token**: `Fuad2004Firoj`
- Click **Verify and Save**

**B. Subscribe to Fields:**
- Check ✅ **messages**
- Check ✅ **messaging_postbacks**
- Click **Save**

### 5. Test the App

1. Open `https://text-reply.vercel.app`
2. Check if the webhook is working: `https://text-reply.vercel.app/api/webhook`
   - Should NOT show 500 error anymore
3. Click "Continue with Facebook" → Login
4. Connect your Page
5. Send a message to your Page → AI should reply!

---

## 🐛 Troubleshooting

| Error | Fix |
|-------|-----|
| Still 500 on `/api/webhook` | Check Vercel logs, verify all env vars are set |
| "URL blocked" on login | Make sure the redirect URI is EXACTLY `https://text-reply.vercel.app/api/auth/facebook/callback` in Facebook settings |
| 500 after Facebook login | Check `DATABASE_URL` and `JWT_SECRET` are set on Vercel |
| Webhook verification fails | Make sure `FB_VERIFY_TOKEN` on Vercel matches exactly what you entered in Facebook webhook settings |
