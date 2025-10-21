# 🔧 Jenkins Startup Issue Fix

## 🎯 **Problem Identified:**

The Jenkins pipeline is failing because:
1. **Docker build succeeds** - TypeScript compiles `server.minimal.ts` to `dist/server.minimal.js`
2. **Container startup fails** - `npm start` tries to run `node dist/server.minimal.js`
3. **File mismatch** - The compiled file might not exist or have wrong name

## 🔍 **Root Cause Analysis:**

Looking at the Jenkins logs:
- `> farmtally-backend@1.0.0 start`
- `> node dist/server.simple.js` ❌ (This is wrong!)

The issue is that `package.json` still shows:
```json
"main": "dist/server.minimal.js",
"start": "node dist/server.minimal.js"
```

But the TypeScript compilation might be creating a different file or failing.

## 🚀 **Solution:**

### **Option 1: Simplify the Build Process**
Instead of compiling TypeScript in Docker, let's use `tsx` to run the TypeScript directly:

```json
"start": "npx tsx src/server.minimal.ts"
```

### **Option 2: Fix the TypeScript Compilation**
Ensure the build creates the right file:

```dockerfile
RUN npx tsc src/server.minimal.ts --outDir dist --target es2020 --module commonjs --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck
```

### **Option 3: Use Simple JavaScript File**
Create a simple `.js` file instead of TypeScript to eliminate compilation issues.

## 🎯 **Recommended Fix:**

Use Option 1 (tsx) as it's the most reliable and eliminates compilation issues.