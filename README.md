# Smart Bookmark Manager

A real-time bookmark manager built with Next.js, Supabase, and Google OAuth.

## 🚀 Live Demo

**Live URL**: [Your Vercel URL will go here]

## 📋 Features

- ✅ Google OAuth authentication (no email/password)
- ✅ Add bookmarks (URL + title)
- ✅ Private bookmarks per user
- ✅ Real-time updates across tabs
- ✅ Delete bookmarks
- ✅ Responsive design with Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 📦 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd bookmark-app
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the following:

```sql
-- Create bookmarks table
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table bookmarks enable row level security;

-- Create policy: Users can only see their own bookmarks
create policy "Users can view own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

-- Create policy: Users can insert their own bookmarks
create policy "Users can insert own bookmarks"
  on bookmarks for insert
  with check (auth.uid() = user_id);

-- Create policy: Users can delete their own bookmarks
create policy "Users can delete own bookmarks"
  on bookmarks for delete
  using (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table bookmarks;
```

3. Go to **Settings > API** and copy:
   - Project URL
   - Anon public key

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable **Google+ API**
4. Go to **Credentials > Create Credentials > OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   ```
   https://<your-supabase-project>.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
7. Copy Client ID and Client Secret

8. In Supabase:
   - Go to **Authentication > Providers > Google**
   - Enable Google provider
   - Paste Client ID and Client Secret
   - Save

### 4. Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

### 6. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

## 🐛 Problems Encountered & Solutions

### Problem 1: OAuth Callback URL Mismatch
**Issue**: After Google login, got redirect errors.

**Solution**: 
- Added both production and localhost callback URLs in Google Cloud Console
- Format: `https://<project-ref>.supabase.co/auth/v1/callback`
- Verified the Site URL in Supabase Authentication settings matched the deployment URL

### Problem 2: Real-time Updates Not Working
**Issue**: Changes in one tab didn't appear in another tab immediately.

**Solution**:
- Enabled Realtime for the bookmarks table using `alter publication supabase_realtime add table bookmarks;`
- Implemented Supabase's real-time subscription in the component with proper cleanup
- Used `useEffect` to subscribe to changes on mount and unsubscribe on unmount

### Problem 3: RLS Policies Blocking Queries
**Issue**: Users couldn't see their own bookmarks even after logging in.

**Solution**:
- Verified that the `user_id` column in bookmarks table references `auth.users`
- Ensured RLS policies use `auth.uid()` to match the currently logged-in user
- Tested policies in Supabase SQL editor before deploying

### Problem 4: Hydration Errors in Next.js
**Issue**: Server-rendered content didn't match client-rendered content due to auth state.

**Solution**:
- Used `useState` and `useEffect` to handle auth state on client side only
- Added loading states to prevent flash of incorrect content
- Ensured consistent rendering between server and client

### Problem 5: URL Validation
**Issue**: Users could add invalid URLs causing broken links.

**Solution**:
- Added client-side validation using URL constructor
- Automatically prepended `https://` if protocol was missing
- Showed clear error messages for invalid URLs

## 📁 Project Structure

```
bookmark-app/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main bookmark page
│   └── auth/
│       └── callback/
│           └── route.ts    # OAuth callback handler
├── components/
│   ├── BookmarkList.tsx    # List of bookmarks with real-time updates
│   ├── AddBookmark.tsx     # Form to add new bookmarks
│   └── Header.tsx          # Navigation with sign out
├── lib/
│   └── supabase.ts         # Supabase client configuration
├── public/
└── package.json
```

## 🧪 Testing Checklist

- [ ] Sign in with Google works
- [ ] Add bookmark with valid URL
- [ ] Bookmark appears in list immediately
- [ ] Open two tabs, add bookmark in one, appears in other
- [ ] Delete bookmark works
- [ ] Sign out and sign back in - bookmarks persist
- [ ] Another user cannot see your bookmarks
- [ ] Invalid URLs show error messages

## 🔐 Security Features

- Row Level Security (RLS) ensures users can only access their own bookmarks
- Supabase Auth handles secure session management
- Environment variables keep sensitive keys secure
- HTTPS enforced in production

## 📝 Notes

- The app uses Next.js App Router (not Pages Router)
- Real-time updates use Supabase's WebSocket connection
- Tailwind CSS provides responsive styling
- All authentication is handled by Supabase + Google OAuth

## 🤝 Contributing

This is a technical assessment project. Feel free to fork and modify for your own use!

## 📄 License

MIT
