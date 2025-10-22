# 🚀 Quick Jenkins Job Update Instructions

## 📋 **WHAT'S BEEN UPDATED**

✅ **jenkins-farmtally-pipeline.groovy** - Updated with complete pipeline
✅ **JENKINS_PIPELINE_UPDATE_GUIDE.md** - Step-by-step instructions

## 🎯 **QUICK UPDATE STEPS**

### **Method 1: Copy-Paste (Easiest)**
1. **Open Jenkins** → Your FarmTally Job → **Configure**
2. **Scroll to Pipeline section**
3. **Select All** existing script and **Delete**
4. **Copy** the content from `jenkins-farmtally-pipeline.groovy`
5. **Paste** into Jenkins pipeline script box
6. **Save** and **Build Now**

### **Method 2: File Upload (If supported)**
1. **Open Jenkins** → Your FarmTally Job → **Configure**
2. **Pipeline** → **Pipeline script from SCM** (if using Git)
3. **Point to** `jenkins-farmtally-pipeline.groovy`
4. **Save** and **Build Now**

## ✅ **VERIFICATION CHECKLIST**

After updating, your pipeline should have these stages:
- [ ] **Checkout** - Source code checkout
- [ ] **Verify Dependencies** - Docker + Node.js check
- [ ] **Build Frontend** - NEW! Frontend build stage
- [ ] **Build Backend Services** - Existing microservices
- [ ] **Deploy to VPS** - NEW! Parallel frontend + backend deployment
- [ ] **Health Check** - NEW! Includes frontend health check

## 🎉 **EXPECTED RESULT**

After successful build:
- **Frontend**: `http://147.93.153.247/farmtally/` ✅
- **API Test**: `http://147.93.153.247/farmtally/test-api` ✅
- **All Backend Services**: Working as before ✅

## 🚨 **IF BUILD FAILS**

### **Node.js Missing Error:**
```bash
# Install Node.js in Jenkins
sudo apt update
sudo apt install nodejs npm
```

### **Frontend Build Error:**
```bash
# Check frontend dependencies
cd farmtally-frontend
npm install
```

### **Permission Error:**
```bash
# Ensure Jenkins has SSH access to VPS
ssh-copy-id root@147.93.153.247
```

---

**Your Jenkins pipeline is now ready for complete FarmTally deployment!** 🚀🌾