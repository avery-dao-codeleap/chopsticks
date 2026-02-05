# Chopsticks MVP - Setup Guide

## Firebase Setup

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Name: "Chopsticks" (or your choice)
4. Disable Google Analytics (optional for MVP)
5. Click "Create project"

### 2. Enable Phone Authentication
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **Phone**
3. Enable it
4. Click **Save**

### 3. Add Android App
1. Click the Android icon (robot)
2. Android package name: `com.chopsticks.app` (match your app.json)
3. App nickname: "Chopsticks Android"
4. Click "Register app"
5. **Download `google-services.json`**
6. Save it to: `chopsticks/android/app/google-services.json`
7. Skip the "Add Firebase SDK" steps (already done)
8. Click "Continue" → "Continue to console"

### 4. Add iOS App
1. Click the iOS icon (Apple)
2. iOS bundle ID: `com.chopsticks.app` (match your app.json)
3. App nickname: "Chopsticks iOS"
4. Click "Register app"
5. **Download `GoogleService-Info.plist`**
6. Save it to: `chopsticks/ios/GoogleService-Info.plist`
7. Skip SDK steps
8. Click "Continue" → "Continue to console"

### 5. Get Project ID
1. Go to **Project Settings** (gear icon)
2. Copy your **Project ID** (e.g., `chopsticks-12345`)
3. Save it - you'll need it for .env

---

## Supabase Setup

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Sign in / Sign up
3. Click **New project**
4. Name: "chopsticks-mvp"
5. Database Password: **Generate a strong password and SAVE IT**
6. Region: Choose closest to Vietnam (Singapore recommended)
7. Pricing plan: **Free**
8. Click **Create new project** (takes ~2 minutes)

### 2. Get Supabase Credentials
1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **anon public** key (long string)
   - **service_role** key (even longer string - keep secret!)

### 3. Run Database Migration
1. Go to **SQL Editor** in Supabase dashboard
2. Click **New query**
3. Copy the entire contents of `chopsticks/supabase/migrations/001_complete_schema.sql`
4. Paste into the editor
5. Click **Run** (bottom right)
6. Should see "Success. No rows returned"

### 4. Seed Restaurant Data
1. In SQL Editor, create another new query
2. Copy contents of `chopsticks/supabase/seed-restaurants.sql`
3. Paste and **Run**

### 5. Deploy Edge Function
1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   cd chopsticks
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Project ref is the part before `.supabase.co` in your URL)

4. Set environment variable for Edge Function:
   ```bash
   supabase secrets set FIREBASE_PROJECT_ID=your-firebase-project-id
   ```

5. Deploy the Edge Function:
   ```bash
   supabase functions deploy exchange-firebase-token
   ```

---

## Environment Variables

Create `.env` file in `chopsticks/` directory:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Firebase (Project ID from Firebase Console)
FIREBASE_PROJECT_ID=your-firebase-project-id

# Expo (optional, for push notifications)
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
```

---

## Verify Setup

Run these checks:

1. **Firebase config files exist:**
   ```bash
   ls android/app/google-services.json
   ls ios/GoogleService-Info.plist
   ```

2. **Environment variables set:**
   ```bash
   cat .env
   ```

3. **Database tables created:**
   - Go to Supabase → Table Editor
   - Should see: users, user_preferences, restaurants, meal_requests, etc.

4. **Edge Function deployed:**
   ```bash
   supabase functions list
   ```
   Should show: `exchange-firebase-token`

---

## Run the App

```bash
cd chopsticks
npx expo start
```

Press `i` for iOS simulator or `a` for Android emulator.

---

## Troubleshooting

### Firebase Phone Auth Not Working
- Check that Phone authentication is enabled in Firebase Console
- For testing, you can add test phone numbers: Firebase Console → Authentication → Sign-in method → Phone → Add test phone number

### Supabase Connection Failing
- Verify URL and anon key in .env
- Check that RLS policies were created (Table Editor → click table → Policies tab)

### Edge Function Errors
- Check logs: `supabase functions logs exchange-firebase-token`
- Verify FIREBASE_PROJECT_ID is set: `supabase secrets list`
