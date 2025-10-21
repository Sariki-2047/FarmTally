// Deploy the updated Edge Function to Supabase
const { execSync } = require('child_process');

console.log('🚀 Deploying updated Edge Function to Supabase...');

try {
  // Note: This requires Supabase CLI to be installed
  // For now, we'll provide manual instructions
  console.log(`
📋 Manual Deployment Instructions:

Since we don't have Supabase CLI installed, please follow these steps:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: qvxcbdglyvzohzdefnet
3. Go to "Edge Functions" in the sidebar
4. Find "farmtally-api" function
5. Click "Edit" or "Deploy"
6. Copy the updated code from: supabase/functions/farmtally-api/index.ts
7. Deploy the function

OR

Install Supabase CLI and run:
npm install -g @supabase/cli
supabase login
supabase functions deploy farmtally-api

The updated code now has a more robust JWT secret that should resolve the "Invalid JWT" error.
`);

} catch (error) {
  console.error('Error:', error.message);
}