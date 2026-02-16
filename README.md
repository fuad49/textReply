# TextReply — Facebook Messenger AI Chatbot

Auto-reply to Facebook Page messages using Google Gemini AI.

---

## 🧠 How This App Is Structured

```
TextReply/
├── backend/     ← Express.js API server (port 4000)
│                  Handles: Facebook login, webhooks, Gemini AI, database
│
├── frontend/    ← Next.js web dashboard (port 3000)
│                  Handles: Login page, page management UI, chat viewer
│
├── package.json ← Root scripts to run EVERYTHING together
└── README.md    ← You are here!
```

> **Don't worry!** Even though the frontend and backend are in separate folders,
> you run them **together with a single command** on your computer.
> They are NOT hosted separately — they both run on your machine at the same time.

---

## 📋 Step-by-Step Setup Guide

### Step 1: Create a Supabase Database (free)

Supabase gives you a free hosted PostgreSQL database — no install needed!

1. Go to https://supabase.com and sign up (free)
2. Click **"New Project"**
3. Name it `textreply`, set a **database password** (save it!), pick a region → Create
4. Wait for the project to finish setting up (~30 seconds)
5. Go to **Settings** (gear icon) → **Database**
6. Scroll to **"Connection string"** → click **"URI"** tab
7. Copy the URI — it looks like:
   `postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
8. Replace `[YOUR-PASSWORD]` in the URI with the password you set in step 3

### Step 2: Create a Facebook App

1. Go to https://developers.facebook.com/
2. Click **"My Apps"** → **"Create App"**
3. Choose **"Business"** type → Next
4. Name it "TextReply" → Create
5. On the App Dashboard, find **"Messenger"** and click **"Set Up"**
6. Under **Settings > Basic**, copy your **App ID** and **App Secret**
7. Under **Facebook Login > Settings**, add this redirect URI:
   ```
   http://localhost:4000/api/auth/facebook/callback
   ```

### Step 3: Get a Google Gemini API Key

1. Go to https://aistudio.google.com/apikey
2. Click **"Create API Key"**
3. Copy the key

### Step 4: Fill in your API keys

Open `backend/.env` and fill in these values:

```env
# Your Supabase connection string (from Step 1)
DATABASE_URL=postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# From Step 2 (Facebook App Dashboard)
FB_APP_ID=paste_your_app_id_here
FB_APP_SECRET=paste_your_app_secret_here

# Just a random password you make up (for webhook verification)
FB_VERIFY_TOKEN=any_random_text_here_123

# From Step 3 (Google AI Studio)
GEMINI_API_KEY=paste_your_gemini_key_here

# Make up a random secret (for login security)
JWT_SECRET=any_long_random_text_here_abc123

# Don't change these
FRONTEND_URL=http://localhost:3000
PORT=4000
```

Also open `frontend/.env.local` and fill in:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_FB_APP_ID=paste_your_app_id_here
```

### Step 5: Install & Run

Open a terminal in the `TextReply` folder and run:

```bash
# Install all dependencies (one time only)
npm run setup

# Start both servers (backend + frontend)
npm run dev
```

You should see:
- Backend running at **http://localhost:4000**
- Frontend running at **http://localhost:3000**

### Step 6: Open the app

1. Go to **http://localhost:3000** in your browser
2. Click **"Continue with Facebook"**
3. Authorize the app
4. On the dashboard, click **"Connect Page"** to connect your Facebook Page

### Step 7: Set up the Webhook (for receiving messages)

To receive messages from Facebook, your backend needs to be accessible from the internet.

**For local testing, use ngrok (free):**

1. Download from https://ngrok.com/download
2. Open a new terminal and run:
   ```bash
   ngrok http 4000
   ```
3. Copy the `https://xxx.ngrok.io` URL it gives you
4. Go back to your Facebook App Dashboard → Messenger → Settings
5. Under **Webhooks**, click **"Add Callback URL"**:
   - **Callback URL**: `https://xxx.ngrok.io/webhook`
   - **Verify Token**: same value as `FB_VERIFY_TOKEN` in your `.env`
6. Subscribe to: **messages**

**That's it!** Now when someone messages your Facebook Page, the AI will auto-reply! 🎉

---

## ❓ FAQ

**Q: Do I need to host frontend and backend separately?**
> No! For development, you run one command (`npm run dev`) and both start together.
> For production hosting, you could use a service like Railway, Render, or Vercel.

**Q: Where is my data stored?**
> In your Supabase database (hosted PostgreSQL in the cloud).
> You can view your data anytime at https://supabase.com → your project → Table Editor.

**Q: Can I customize how the AI replies?**
> Yes! On the dashboard, each connected page has a "System Prompt" text box.
> Write instructions like "You are a pizza restaurant assistant. Our hours are 9am-10pm."

**Q: What is ngrok?**
> It creates a temporary public URL that points to your local computer,
> so Facebook can send messages to your backend. Free for development.

---

## 🔧 Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Backend API | Express.js | Handles all logic |
| Frontend UI | Next.js | Web dashboard |
| Database | Supabase (PostgreSQL) | Stores everything |
| AI | Google Gemini 2.0 | Generates replies |
| Auth | Facebook OAuth | Login system |
| Messaging | Meta Messenger API | Send/receive messages |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/facebook` | Start Facebook login |
| GET | `/api/auth/facebook/callback` | OAuth callback |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/pages` | List your FB pages |
| GET | `/api/pages/connected` | List connected pages |
| POST | `/api/pages/connect` | Connect a page |
| PUT | `/api/pages/:id/context` | Update AI prompt |
| PUT | `/api/pages/:id/toggle` | Toggle auto-reply |
| DELETE | `/api/pages/:id` | Disconnect page |
| GET | `/webhook` | FB webhook verify |
| POST | `/webhook` | Receive messages |
