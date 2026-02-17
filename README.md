# 📚 Smart Bookmark Manager

A full-stack real-time bookmark manager where users sign in with Google, save private bookmarks, and see changes sync instantly across all open tabs — without any page refresh.

---

## 🔗 Links

| | URL |
|---|---|
| 🌐 **Live App** | https://smart-bookmark-app-zeta-five.vercel.app |
| 💻 **GitHub Repo** | https://github.com/Kashish101/smart-bookmark-app |

---

## ✅ Requirements Met

| Requirement | Status |
|---|---|
| Google OAuth only (no email/password) | ✅ Done |
| Add bookmark (URL + title) | ✅ Done |
| Bookmarks private per user | ✅ Done via RLS |
| Real-time sync without page refresh | ✅ Done via Supabase Realtime |
| Delete own bookmarks | ✅ Done |
| Deployed on Vercel | ✅ Done |
| Next.js App Router | ✅ Done |
| Supabase Auth + Database + Realtime | ✅ Done |
| Tailwind CSS | ✅ Done |

---

## ✨ Features

- 🔐 **Google OAuth** — One-click sign in with Google. No passwords stored anywhere
- 📌 **Add Bookmarks** — Save any URL with a custom title. `https://` added automatically
- 🔒 **Private Bookmarks** — Enforced at database level using Row Level Security. User A can never see User B's data
- ⚡ **Real-Time Sync** — Open the app in 2 tabs. Add a bookmark in Tab 1 — appears in Tab 2 instantly via WebSocket
- 🗑️ **Delete Bookmarks** — Hover any bookmark to reveal delete button
- 🌙 **Dark / Light Theme** — Toggle with preference saved in localStorage
- 🖼️ **Website Favicons** — Automatically fetches and shows each site's icon
- 📱 **Fully Responsive** — Works on mobile, tablet, and desktop

---

## 🛠️ Tech Stack

| Technology | Why |
|---|---|
| **Next.js 14 (App Router)** | Modern React framework with server and client components |
| **Supabase Auth** | Handles Google OAuth and session management securely |
| **Supabase PostgreSQL** | Database with Row Level Security for data isolation |
| **Supabase Realtime** | WebSocket-based live updates across tabs |
| **Tailwind CSS** | Fast, utility-first styling |
| **Vercel** | Zero-config deployment for Next.js |

---

## 📁 Project Structure

```
smart-bookmark-app/
├── app/
│   ├── auth/callback/route.ts     # Google OAuth callback handler
│   ├── globals.css                # Design system + dark/light themes
│   ├── layout.tsx                 # Root layout with fonts
│   └── page.tsx                   # Main page — shows hero or dashboard
│
├── components/
│   ├── Header.tsx                 # Logo + theme toggle + sign in/out
│   ├── AddBookmark.tsx            # Form with URL validation
│   └── BookmarkList.tsx           # Realtime list with live indicator
│
├── lib/
│   └── supabase.ts                # Supabase client (single instance)
│
├── .env.local                     # API keys (not committed to git)
├── .env.example                   # Template for environment variables
└── README.md
```

---

## 🗄️ Database Schema

```sql
-- Table
CREATE TABLE bookmarks (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID    REFERENCES auth.users NOT NULL,
  title       TEXT    NOT NULL,
  url         TEXT    NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Security: enable RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can only read their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can only insert their own bookmarks
CREATE POLICY "Users can create their own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can only delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Enable real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

---

## ⚡ How Real-Time Works

```javascript
// BookmarkList.tsx — Subscribe to live changes
const channel = supabase
  .channel(`bookmarks-${userId}-${Date.now()}`)
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'bookmarks' },
    (payload) => {
      // New bookmark added somewhere → update UI instantly
      setBookmarks(prev => [payload.new, ...prev])
    }
  )
  .on('postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'bookmarks' },
    (payload) => {
      // Bookmark deleted → remove from UI instantly
      setBookmarks(prev => prev.filter(b => b.id !== payload.old.id))
    }
  )
  .subscribe((status) => {
    // Shows 🟢 Live / 🟡 Connecting / 🔴 Error in UI
    setLiveStatus(status)
  })
```

The green **Live** dot in the UI confirms the WebSocket connection is active.

---

## 🚀 Local Development

### 1. Clone & Install
```bash
git clone https://github.com/Kashish101/smart-bookmark-app.git
cd smart-bookmark-app
npm install
```

### 2. Create `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Supabase
- Create project at [supabase.com](https://supabase.com)
- Run the SQL schema above in SQL Editor
- Enable Google provider in Authentication → Providers

### 4. Set Up Google OAuth
- Create OAuth credentials at [console.cloud.google.com](https://console.cloud.google.com)
- Add Supabase callback URL to Authorized Redirect URIs:
  ```
  https://[your-project].supabase.co/auth/v1/callback
  ```

### 5. Run
```bash
npm run dev
# Open http://localhost:3000
```

---

## 🔐 Security Model

**Row Level Security** is enforced at the PostgreSQL level — not just the frontend. This means:

- Even direct API requests with the anon key cannot access other users' data
- The `auth.uid() = user_id` check runs inside the database engine itself
- No amount of frontend manipulation can bypass this

**Google OAuth** means:
- No passwords stored in our database
- Session tokens managed by Supabase
- Token refresh handled automatically

---

## 🐛 Problems Encountered & Solutions

### Problem 1: Real-time sync not working across tabs
**Error**: Adding a bookmark in Tab 1 didn't appear in Tab 2.

**Root cause**: The Supabase realtime publication wasn't properly set up for the bookmarks table.

**Fix**:
```sql
-- Reset the publication
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE bookmarks;
```
Also rewrote the subscription to use separate `.on()` handlers for INSERT and DELETE instead of a wildcard `event: '*'`, and used a unique channel name per session to prevent stale subscriptions.

---

### Problem 2: `createClientComponentClient is not a function`
**Error**: Runtime error on page load after updating components.

**Root cause**: `@supabase/auth-helpers-nextjs` version mismatch — the function wasn't exported correctly.

**Fix**: Switched to the base `@supabase/supabase-js` package directly:
```javascript
// Before (broken)
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
const supabase = createClientComponentClient()

// After (fixed)
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

### Problem 3: Vercel build failed — module not found
**Error**:
```
Type error: Module '@supabase/auth-helpers-nextjs' has no exported member 'createRouteHandlerClient'
```

**Root cause**: `app/auth/callback/route.ts` used `createRouteHandlerClient` which wasn't available.

**Fix**: Replaced with direct `createClient` from base package:
```javascript
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  await supabase.auth.exchangeCodeForSession(code)
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
```

---

### Problem 4: Google OAuth redirecting to localhost on production
**Error**: Clicking "Sign in with Google" on the live Vercel URL redirected to `localhost:3000/?error` instead of the production URL.

**Root cause**: Supabase Site URL was still set to `localhost:3000`.

**Fix**:
- Updated Supabase → Authentication → URL Configuration → Site URL to:
  ```
  https://smart-bookmark-app-zeta-five.vercel.app
  ```
- Added production URL to Redirect URLs in Supabase
- Added production URL to Authorized JavaScript Origins in Google Cloud Console

---

### Problem 5: redirect_uri_mismatch on OAuth
**Error**: Google returned `redirect_uri_mismatch` during sign-in.

**Root cause**: Typed the callback URL manually with a small typo.

**Fix**: Always copy-paste the exact Callback URL shown in Supabase → Authentication → Providers → Google into Google Cloud Console. Never type OAuth URLs manually.

---

## 🎨 Design Decisions

- **Dark-first** with a full light mode that persists via `localStorage`
- **Syne** display font — geometric, modern, distinctive
- **DM Sans** body font — clean and highly readable
- **Purple accent** (`#7c6dfa`) — distinctive without being aggressive
- **Live indicator** — small pulsing green dot shows WebSocket connection status
- **Hover-reveal delete** — keeps the list clean, trash icon appears on hover only
- **Auto favicon** — fetches `google.com/s2/favicons` for each bookmark URL


*Built with Next.js 14, Supabase, and Tailwind CSS · Deployed on Vercel*
