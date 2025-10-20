@echo off
echo Setting up Vercel environment variables...

cd farmtally-frontend

echo Adding NEXT_PUBLIC_SUPABASE_URL...
echo https://qvxcbdglyvzohzdefnet.supabase.co | vercel env add NEXT_PUBLIC_SUPABASE_URL production

echo Adding NEXT_PUBLIC_SUPABASE_ANON_KEY...
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eGNiZGdseXZ6b2h6ZGVmbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTQxMzgsImV4cCI6MjA3NjI3MDEzOH0.hMzK3q1lQQPy7y0KMURxN-NwlOMO7WN_wFttWMyu9GM | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

echo Adding NEXT_PUBLIC_API_URL...
echo https://qvxcbdglyvzohzdefnet.supabase.co/functions/v1/farmtally-api | vercel env add NEXT_PUBLIC_API_URL production

echo Adding NEXT_PUBLIC_SOCKET_URL...
echo https://qvxcbdglyvzohzdefnet.supabase.co | vercel env add NEXT_PUBLIC_SOCKET_URL production

echo Adding NEXT_PUBLIC_APP_NAME...
echo FarmTally | vercel env add NEXT_PUBLIC_APP_NAME production

echo Adding NEXT_PUBLIC_APP_VERSION...
echo 1.0.0 | vercel env add NEXT_PUBLIC_APP_VERSION production

echo Environment variables added! Now redeploying...
vercel --prod

echo Done! Your app should now work with the environment variables.