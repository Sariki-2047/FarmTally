# 🚀 GitHub Setup Instructions

## Step 1: Create GitHub Repository

1. **Go to GitHub:** https://github.com/new
2. **Repository name:** `FarmTally`
3. **Description:** `Complete corn procurement management system with Next.js frontend and Supabase backend`
4. **Visibility:** Public
5. **Click:** "Create repository"

## Step 2: Connect Local Repository

After creating the repository on GitHub, run these commands:

```bash
git remote add origin https://github.com/YOUR_USERNAME/FarmTally.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 3: Deploy from GitHub

Once pushed to GitHub, you can deploy using:

### Option A: Vercel from GitHub
1. Go to https://vercel.com
2. Click "New Project"
3. Import from GitHub: `YOUR_USERNAME/FarmTally`
4. Set root directory to: `farmtally-frontend`
5. Add environment variables (we'll help with this)

### Option B: Netlify from GitHub
1. Go to https://netlify.com
2. Click "New site from Git"
3. Choose GitHub: `YOUR_USERNAME/FarmTally`
4. Set publish directory to: `farmtally-frontend/.next`

## Step 4: Environment Variables

After deployment, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://qvxcbdglyvzohzdefnet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eGNiZGdseXZ6b2h6ZGVmbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTQxMzgsImV4cCI6MjA3NjI3MDEzOH0.hMzK3q1lQQPy7y0KMURxN-NwlOMO7WN_wFttWMyu9GM
NEXT_PUBLIC_API_URL=https://qvxcbdglyvzohzdefnet.supabase.co/functions/v1/farmtally-api
NEXT_PUBLIC_SOCKET_URL=https://qvxcbdglyvzohzdefnet.supabase.co
NEXT_PUBLIC_APP_NAME=FarmTally
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🎯 Next Steps

1. Create the GitHub repository
2. Push the code
3. Deploy from GitHub
4. Add environment variables
5. Test the live application

Your FarmTally application will then be publicly accessible!