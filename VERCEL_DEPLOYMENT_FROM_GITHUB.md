# 🚀 Deploy FarmTally from GitHub to Vercel

## ✅ Step 1: Code is on GitHub
Your repository is now live at: **https://github.com/Sariki-2047/FarmTally**

## 🚀 Step 2: Deploy to Vercel

### 2.1 Go to Vercel
1. Visit: **https://vercel.com**
2. Click **"New Project"**

### 2.2 Import from GitHub
1. Look for **"Import Git Repository"**
2. Search for: **`Sariki-2047/FarmTally`**
3. Click **"Import"**

### 2.3 Configure Project Settings
**IMPORTANT:** Set these settings:

- **Project Name:** `farmtally`
- **Framework Preset:** Next.js (should auto-detect)
- **Root Directory:** `farmtally-frontend` ⚠️ **CRITICAL**
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)

### 2.4 Add Environment Variables
Click **"Environment Variables"** and add these:

```
NEXT_PUBLIC_SUPABASE_URL=https://qvxcbdglyvzohzdefnet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eGNiZGdseXZ6b2h6ZGVmbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTQxMzgsImV4cCI6MjA3NjI3MDEzOH0.hMzK3q1lQQPy7y0KMURxN-NwlOMO7WN_wFttWMyu9GM
NEXT_PUBLIC_API_URL=https://qvxcbdglyvzohzdefnet.supabase.co/functions/v1/farmtally-api
NEXT_PUBLIC_SOCKET_URL=https://qvxcbdglyvzohzdefnet.supabase.co
NEXT_PUBLIC_APP_NAME=FarmTally
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 2.5 Deploy
1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Get your live URL!

## 🎯 Expected Result

You'll get a public URL like:
- `https://farmtally-xyz123.vercel.app`

This will be:
✅ **Publicly accessible** (no login required)
✅ **Connected to your working backend**
✅ **Automatically updated** when you push to GitHub
✅ **Production ready**

## 🔧 If Build Fails

If the build fails, check:
1. **Root Directory** is set to `farmtally-frontend`
2. **Environment Variables** are added correctly
3. **Framework** is detected as Next.js

## 📱 Test Your Deployment

Once deployed, test these URLs:
- **Main App:** `https://your-app.vercel.app`
- **API Test:** `https://your-app.vercel.app/test-api`
- **Login:** `https://your-app.vercel.app/login`

Your FarmTally application will be live and ready for users! 🚀