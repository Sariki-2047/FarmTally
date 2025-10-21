# Remove Vercel Dependencies - Action Plan

## Files to Delete
1. `VERCEL_DEPLOYMENT_FROM_GITHUB.md`
2. `setup-vercel-env.bat`

## Files to Update

### 1. Backend Email Templates
**File:** `simple-supabase-backend.cjs`
- Line 78: Change `https://farmtally.vercel.app/login` → `https://yourdomain.com/login`
- Line 93: Change `https://farmtally.vercel.app/login` → `https://yourdomain.com/login`
- Line 117: Change `https://farmtally.vercel.app/admin/approvals` → `https://yourdomain.com/admin/approvals`
- Line 127: Change `https://farmtally.vercel.app/admin/approvals` → `https://yourdomain.com/admin/approvals`

### 2. Documentation Updates
**Files to update with your VPS domain:**
- `DEVELOPER_HANDOVER_DOCUMENT.md` - Remove Vercel deployment section
- `FARMTALLY_DEPLOYMENT_GUIDE.md` - Remove Vercel options
- `PRODUCTION_DEPLOYMENT_SUCCESS.md` - Update all vercel.app URLs
- `EMAIL_PRODUCTION_DEPLOYMENT_SUCCESS.md` - Update frontend URL
- `BACKEND_ENDPOINTS_FIX_COMPLETE.md` - Update email links

### 3. Environment Variables
Update these in your VPS environment:
```bash
# Frontend (.env.production)
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com

# Backend (.env)
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### 4. Package.json (No Changes Needed)
✅ No Vercel-specific dependencies found in package.json files

### 5. Next.js Configuration
✅ No vercel.json configuration files found
✅ No Vercel-specific Next.js config detected

## Optional Cleanup
- Remove `vercel.svg` files from public folders
- Keep `.vercel` entries in .gitignore (harmless)

## Summary
The project is **mostly VPS-ready**! Main changes needed:
1. Delete 2 Vercel-specific files
2. Update email template URLs in backend
3. Update documentation references
4. Set correct environment variables for your domain

**Impact:** Minimal - mostly documentation and email links.