# 🚀 TextReply — Complete Setup Guide (Beginner Friendly)

Follow this guide **exactly** step by step. You don't need to know any coding.

---

## PART 1: Get Your API Keys (3 services)

You need keys from 3 places: **Supabase** (database), **Facebook** (login + messaging), and **Google** (AI).

---

### 🟢 1A. Supabase (Database) — You Already Have This!

Your Supabase project: `https://fejxbeejxcgesozqlpty.supabase.co`

**Get your connection string:**
1. Open https://supabase.com and log in
2. Click on your project (`fejxbeejxcgesozqlpty`)
3. Click the **⚙️ gear icon** (Settings) in the left sidebar
4. Click **"Database"**
5. Look for a section called **"Connection string"**
6. You'll see something like:
   ```
   postgresql://postgres.fejxbeejxcgesozqlpty:[YOUR-PASSWORD]@aws-0-....pooler.supabase.com:6543/postgres
   ```
7. Copy it
8. Replace `[YOUR-PASSWORD]` with the password you set when creating the project

> ⚠️ **Forgot your password?** In Settings → Database, there's a "Reset database password" button. Use it to set a new one.

**Save this connection string** — you'll paste it later.

---

### 🔵 1B. Facebook App (Login + Messaging)

This is the longest part. Follow carefully:

**Step 1 — Go to Facebook Developers**
1. Open https://developers.facebook.com/
2. Click **"Log In"** (top right) and log in with your Facebook account
3. Click **"My Apps"** (top right)

**Step 2 — Create a New App**
1. Click **"Create App"**
2. You'll see app types — choose **"Other"** → click Next
3. Select **"Business"** → click Next  
4. Fill in:
   - **App name**: `TextReply`
   - **Contact email**: your email
5. Click **"Create App"**
6. You might need to enter your Facebook password to confirm

**Step 3 — Get Your App ID and Secret**
1. You're now on the App Dashboard
2. Click **"Settings"** in the left sidebar → **"Basic"**
3. You'll see:
   - **App ID**: a number like `123456789012345` → Copy this
   - **App Secret**: click **"Show"** → enter password → Copy this

**Save both the App ID and App Secret** — you'll paste them later.

**Step 4 — Add Facebook Login Product**
1. In the left sidebar, scroll down and click **"Add Product"** (or look for a **+ icon**)
2. Find **"Facebook Login"** → click **"Set Up"**
3. Choose **"Web"**
4. For "Site URL" enter: `http://localhost:3000` → click Save
5. Now click **"Facebook Login"** → **"Settings"** in the left sidebar
6. Under **"Valid OAuth Redirect URIs"**, add:
   ```
   http://localhost:4000/api/auth/facebook/callback
   ```
7. Click **"Save Changes"**

**Step 5 — Add Messenger Product**
1. Go back to the left sidebar → click **"Add Product"** again
2. Find **"Messenger"** → click **"Set Up"**
3. You're now on the Messenger Settings page

**Step 6 — Connect Your Facebook Page**
1. On the Messenger Settings page, look for **"Access Tokens"** section
2. Click **"Add or remove Pages"**
3. A popup will appear → select the Facebook Page you want to connect
4. Click **"Done"** → then **"OK"**
5. You should now see your page listed with a **"Generate Token"** button
   - You DON'T need to click this — the app does it automatically through login

**Step 7 — Set App Permissions (Important!)**
1. In the left sidebar, click **"App Review"** → **"Permissions and Features"**
2. Find and request these permissions:
   - `pages_show_list` — click "Get Advanced Access"
   - `pages_messaging` — click "Get Advanced Access"  
   - `pages_manage_metadata` — click "Get Advanced Access"
   - `pages_read_engagement` — click "Get Advanced Access"

> ⚠️ **Note**: For testing with your own account, "Standard Access" is enough. You only need "Advanced Access" when going public.

**Step 8 — Set App to Development Mode**
1. At the top of the page, make sure the toggle says **"In Development"** (green)
2. This is fine for testing — it means only you can use the app

---

### 🟡 1C. Google Gemini API Key

1. Open https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select any Google Cloud project (or create one if asked)
5. Copy the API key that appears

**Save this API key** — you'll paste it next.

---

## PART 2: Fill In Your Keys

Now open these 2 files in your code editor and fill in the values you collected:

### File 1: `backend/.env`

Open `d:\Antigravity\TextReply\backend\.env` and update these lines:

```env
# Paste your Supabase connection string here (from Step 1A)
DATABASE_URL=postgresql://postgres.fejxbeejxcgesozqlpty:YOUR_ACTUAL_PASSWORD@aws-0-....pooler.supabase.com:6543/postgres

# Paste your Facebook App ID (from Step 1B, Step 3)
FB_APP_ID=123456789012345

# Paste your Facebook App Secret (from Step 1B, Step 3)
FB_APP_SECRET=abcdef1234567890abcdef

# Leave this as-is (or change to any random text)
FB_VERIFY_TOKEN=textreply_webhook_verify_token_2024

# Paste your Gemini API Key (from Step 1C)
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx

# Change this to any random long text (for security)
JWT_SECRET=mySuper$ecretKey12345abc

# Don't change these
FRONTEND_URL=http://localhost:3000
PORT=4000
```

### File 2: `frontend/.env.local`

Open `d:\Antigravity\TextReply\frontend\.env.local` and update:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_FB_APP_ID=123456789012345
```

> Replace `123456789012345` with your **actual Facebook App ID** (same one from the backend .env).

---

## PART 3: Run the Server

Open a **terminal** (Command Prompt or PowerShell) and run these commands:

```bash
# Step 1: Go to the project folder
cd d:\Antigravity\TextReply

# Step 2: Install everything (only needed the first time)
npm run setup

# Step 3: Start both servers
npm run dev
```

**If successful, you'll see something like:**
```
[0] ✅ PostgreSQL connected successfully
[0] ✅ Database models synced
[0] 🚀 Server: http://localhost:4000
[1] ▲ Next.js - Local: http://localhost:3000
```

> ⚠️ **If you see a database error**: Double-check your `DATABASE_URL` in `backend/.env`. Make sure the password is correct and there are no spaces.

---

## PART 4: Open the App

1. Open your browser
2. Go to: **http://localhost:3000**
3. You'll see the TextReply login page
4. Click **"Continue with Facebook"**
5. Facebook will ask you to authorize the app → Click **"Continue"**
6. You'll be redirected to the Dashboard!

---

## PART 5: Set Up Webhook (To Receive Messages)

For Facebook to send messages to your app, it needs a **public URL** (your localhost isn't accessible from the internet). We use **ngrok** for this.

### 5A. Install ngrok

1. Go to https://ngrok.com/download
2. Download the Windows version
3. Unzip it to any folder (like `C:\ngrok\`)
4. Open https://dashboard.ngrok.com/signup → sign up (free)
5. Go to https://dashboard.ngrok.com/get-started/your-authtoken
6. Copy your auth token
7. Open a **new terminal** and run:
   ```bash
   C:\ngrok\ngrok authtoken YOUR_TOKEN_HERE
   ```

### 5B. Start ngrok

In that same terminal, run:
```bash
C:\ngrok\ngrok http 4000
```

You'll see something like:
```
Forwarding    https://a1b2c3d4.ngrok-free.app -> http://localhost:4000
```

**Copy the `https://xxxx.ngrok-free.app` URL** — you need it next.

> ⚠️ Keep this terminal **open**! Closing it kills the tunnel.

### 5C. Register the Webhook on Facebook

1. Go back to https://developers.facebook.com/ → Your App → Messenger → Settings
2. Scroll to the **"Webhooks"** section
3. Click **"Add Callback URL"** (or "Edit Callback URL")
4. Fill in:
   - **Callback URL**: `https://a1b2c3d4.ngrok-free.app/webhook` (your ngrok URL + `/webhook`)
   - **Verify Token**: `textreply_webhook_verify_token_2024` (same as in your `.env`)
5. Click **"Verify and Save"**
6. If successful, you'll see ✅ — it means Facebook connected to your server!
7. Now click **"Add Subscriptions"** → check **"messages"** → Save

---

## PART 6: Test It!

1. Make sure ALL 3 terminals are running:
   - Terminal 1: `npm run dev` (in TextReply folder)
   - Terminal 2: `ngrok http 4000`
2. Open http://localhost:3000 → Log in → Connect your Page on the Dashboard
3. Open Facebook Messenger from **another Facebook account** (or have a friend message your page)
4. Send a message to your connected Facebook Page
5. Watch the backend terminal — you should see:
   ```
   📨 Message from 12345 on page 67890: "Hello!"
   🤖 Calling Gemini AI...
   ✅ Reply sent: "Hi there! How can I help you today?"
   ```
6. The AI reply will appear in Messenger automatically! 🎉

---

## ❓ Common Problems

| Problem | Solution |
|---------|----------|
| "Cannot connect to database" | Check your `DATABASE_URL` password in `backend/.env` |
| Facebook login shows error | Make sure `FB_APP_ID` and `FB_APP_SECRET` are correct |
| Facebook login redirects to blank page | Check that `http://localhost:4000/api/auth/facebook/callback` is in your Facebook Login → Settings → Valid OAuth Redirect URIs |
| Webhook verification fails | Make sure ngrok is running AND the verify token matches your `.env` |
| Messages received but no AI reply | Check your `GEMINI_API_KEY` is valid |
| "App not set up" on Facebook login | Your app is in Development mode — add yourself as a tester in App Roles |
| ngrok URL changed | Every time you restart ngrok, you get a new URL. Update the webhook URL on Facebook |

---

## 🔄 Daily Usage

Every time you want to use the app:

```bash
# Terminal 1: Start the app
cd d:\Antigravity\TextReply
npm run dev

# Terminal 2: Start ngrok (for receiving messages)
C:\ngrok\ngrok http 4000
```

> ⚠️ If ngrok gives you a new URL, update it on Facebook (Messenger → Settings → Webhooks → Edit Callback URL)

Then open **http://localhost:3000** in your browser!
