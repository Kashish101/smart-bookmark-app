# 🚀 Deployment Guide - Smart Bookmark Manager

Follow these steps carefully to deploy your bookmark app in under 30 minutes.

## ✅ Pre-Deployment Checklist

Before you start, make sure you have:
- [ ] A GitHub account
- [ ] A Supabase account (free tier is fine)
- [ ] A Vercel account (free tier is fine)
- [ ] A Google Cloud account (for OAuth)

---

## 📝 Step 1: Create Supabase Project (5 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "New Project"
3. Fill in:
   - **Project name**: `bookmark-app` (or any name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to you
4. Click "Create new project" and wait 2-3 minutes

---

## 🗄️ Step 2: Set Up Database (3 minutes)

1. In your Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase-setup.sql` from this project
4. Paste it into the SQL editor
5. Click **Run** or press `Ctrl/Cmd + Enter`
6. You should see "Setup Complete!" message

**Verify it worked:**
- Go to **Table Editor** (left sidebar)
- You should see a `bookmarks` table with columns: id, user_id, title, url, created_at

---

## 🔑 Step 3: Get Supabase Credentials (2 minutes)

1. In Supabase dashboard, click **Settings** (⚙️ icon, bottom left)
2. Click **API** in the left menu
3. Copy these two values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (under "Project API keys")
4. Keep these handy - you'll need them soon!

---

## 🔐 Step 4: Set Up Google OAuth (10 minutes)

### Part A: Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select existing one
3. In the search bar at top, search for "Google+ API" and enable it
4. In the left sidebar, click **APIs & Services > Credentials**
5. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
6. If prompted, configure the OAuth consent screen first:
   - User Type: **External**
   - App name: `Bookmark Manager`
   - User support email: your email
   - Developer contact: your email
   - Click **Save and Continue** through the screens
7. Back to creating credentials:
   - Application type: **Web application**
   - Name: `Bookmark App`
   - **Authorized redirect URIs** - Click "+ Add URI" and add:
     ```
     https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
     ```
   - Replace `YOUR_SUPABASE_PROJECT_REF` with the part before `.supabase.co` in your Project URL
   - Click **Create**
8. Copy the **Client ID** and **Client Secret** (keep these safe!)

### Part B: Configure in Supabase

1. Back in Supabase, go to **Authentication** (left sidebar)
2. Click **Providers**
3. Find **Google** and click to expand
4. Toggle **Enable Sign in with Google**
5. Paste your:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)
6. Copy the **Callback URL** shown (should match what you added to Google)
7. Click **Save**

---

## 💻 Step 5: Prepare Your Code (5 minutes)

1. Create a `.env.local` file in your project root:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
   ```

3. Test locally:
   ```bash
   npm install
   npm run dev
   ```

4. Open `http://localhost:3000` - you should see the app!

5. Try signing in with Google - if it works, you're ready to deploy!

---

## 🌐 Step 6: Deploy to Vercel (5 minutes)

### Part A: Push to GitHub

1. Initialize git (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Smart Bookmark App"
   ```

2. Create a new repository on GitHub:
   - Go to [github.com/new](https://github.com/new)
   - Name it `bookmark-app`
   - Make it **public** (required for submission)
   - Don't initialize with README (you already have one)
   - Click "Create repository"

3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/bookmark-app.git
   git branch -M main
   git push -u origin main
   ```

### Part B: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your GitHub repository (`bookmark-app`)
4. In "Configure Project":
   - Framework Preset: **Next.js** (should auto-detect)
   - Root Directory: `./` (leave as is)
   - Click **Environment Variables**
5. Add these environment variables:
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: [paste your Supabase URL]

   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: [paste your Supabase anon key]
   ```
6. Click **Deploy**
7. Wait 2-3 minutes for deployment to complete

---

## ⚙️ Step 7: Update OAuth Redirect URLs (3 minutes)

Now that you have a Vercel URL, you need to update Google OAuth:

1. Copy your Vercel deployment URL (e.g., `https://bookmark-app-xyz.vercel.app`)
2. Go back to [Google Cloud Console](https://console.cloud.google.com)
3. Navigate to **APIs & Services > Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", click **+ ADD URI**
6. Add:
   ```
   https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   (Same as before, just confirming it's there)
7. Click **Save**

8. In Supabase:
   - Go to **Authentication > URL Configuration**
   - Set **Site URL** to your Vercel URL: `https://bookmark-app-xyz.vercel.app`
   - Add to **Redirect URLs**:
     ```
     https://bookmark-app-xyz.vercel.app/auth/callback
     ```
   - Click **Save**

---

## 🧪 Step 8: Test Your Deployment (5 minutes)

1. Visit your Vercel URL
2. Click "Sign in with Google"
3. Authorize the app
4. Add a bookmark with title and URL
5. The bookmark should appear immediately
6. **Real-time test**: 
   - Open your app in a second browser tab
   - Add a bookmark in one tab
   - Watch it appear in the other tab automatically! 🎉
7. Test delete functionality
8. Sign out and sign back in - bookmarks should persist

---

## 📋 Final Submission Checklist

Before submitting, verify:

- [ ] Live Vercel URL is working
- [ ] Can sign in with Google
- [ ] Can add bookmarks
- [ ] Can delete bookmarks
- [ ] Real-time sync works (test in two tabs)
- [ ] GitHub repo is public
- [ ] README.md is complete with problems/solutions section
- [ ] No `.env.local` committed to GitHub (check `.gitignore`)

---

## 🐛 Troubleshooting Common Issues

### "Invalid grant" error when signing in
- **Fix**: Check that your Google OAuth redirect URI exactly matches your Supabase callback URL
- Verify Site URL in Supabase Authentication settings

### Bookmarks not appearing
- **Fix**: Check browser console for errors
- Verify RLS policies are set correctly in Supabase
- Make sure you ran the entire SQL setup script

### Real-time not working
- **Fix**: Verify `alter publication supabase_realtime add table bookmarks;` was executed
- Check that the realtime subscription code is correct in `BookmarkList.tsx`

### 404 on OAuth callback
- **Fix**: Ensure `/app/auth/callback/route.ts` exists
- Verify the route is using App Router syntax (not Pages Router)

### Environment variables not loading
- **Fix**: In Vercel, redeploy after adding environment variables
- Environment variable names must start with `NEXT_PUBLIC_` for client-side access

---

## 🎯 Success!

Your Smart Bookmark Manager should now be live and fully functional! 

**What to submit:**
1. Your live Vercel URL
2. Your GitHub repository (public)
3. Updated README.md with problems you encountered

Good luck! 🚀
