# FarmTally Migration Plan: Old Services → Consolidated System

## 🎯 **Current State Analysis**

### **Active Services (Old System):**
- ✅ Auth Service (Port 8081)
- ✅ Field Manager (Port 8088) 
- ✅ Farm Admin (Port 8089)
- ✅ API Gateway (Port 8090)

### **Port 8080 Conflict:**
- ⚠️ Something is running on port 8080 (returns 302/403)
- 🎯 We need port 8080 for consolidated Nginx proxy

## 🚀 **Migration Strategy Options**

### **Option A: Clean Migration (Recommended)**
```bash
# Step 1: Stop old services
ssh root@147.93.153.247 "
  docker-compose -f docker-compose.microservices.yml down
  docker system prune -f
"

# Step 2: Clear port 8080 (identify what's using it)
ssh root@147.93.153.247 "
  netstat -tulpn | grep :8080
  # Stop Apache/Nginx if needed:
  systemctl stop apache2 || systemctl stop nginx
"

# Step 3: Deploy consolidated system
./deploy-consolidated.ps1

# Step 4: Verify deployment
node test-consolidated-deployment.js
```

### **Option B: Alternative Port (Safe)**
```bash
# Use port 8085 instead of 8080 for consolidated system
# Modify docker-compose.consolidated.yml:
# ports: "8085:80" instead of "8080:80"

# Then deploy without conflicts
./deploy-consolidated.ps1
```

### **Option C: Coexistence (Testing)**
```bash
# Keep old services running
# Deploy consolidated on port 8085
# Test both systems
# Switch when ready
```

## 📋 **Step-by-Step Migration Process**

### **Phase 1: Preparation**
1. **Backup current system:**
   ```bash
   ssh root@147.93.153.247 "
     docker-compose -f docker-compose.microservices.yml ps > backup-services.txt
     docker images > backup-images.txt
   "
   ```

2. **Identify port 8080 usage:**
   ```bash
   ssh root@147.93.153.247 "
     netstat -tulpn | grep :8080
     ps aux | grep -E '(apache|nginx|httpd)'
   "
   ```

### **Phase 2: Migration**
1. **Stop old services:**
   ```bash
   ssh root@147.93.153.247 "
     docker-compose -f docker-compose.microservices.yml down
   "
   ```

2. **Clear port 8080:**
   ```bash
   ssh root@147.93.153.247 "
     # Stop web server if needed
     systemctl stop apache2 2>/dev/null || true
     systemctl stop nginx 2>/dev/null || true
   "
   ```

3. **Deploy consolidated:**
   ```bash
   ./deploy-consolidated.ps1
   ```

### **Phase 3: Verification**
1. **Test all endpoints:**
   ```bash
   node test-consolidated-deployment.js
   ```

2. **Verify functionality:**
   - Frontend: http://147.93.153.247:8080/farmtally/
   - API: http://147.93.153.247:8080/farmtally/auth-service/health
   - Health: http://147.93.153.247:8080/health

### **Phase 4: Rollback Plan (If Needed)**
```bash
# If consolidated deployment fails:
ssh root@147.93.153.247 "
  docker-compose -f docker-compose.consolidated.yml down
  docker-compose -f docker-compose.microservices.yml up -d
"
```

## 🎯 **Recommended Action**

**Use Option A (Clean Migration)** because:
- ✅ Eliminates resource waste
- ✅ Provides clean, production-ready system
- ✅ Resolves port conflicts
- ✅ Single system to maintain

## ⚡ **Quick Migration Command**
```bash
# One-command migration:
ssh root@147.93.153.247 "
  docker-compose -f docker-compose.microservices.yml down &&
  systemctl stop apache2 2>/dev/null || true &&
  systemctl stop nginx 2>/dev/null || true
" && ./deploy-consolidated.ps1
```

This will:
1. Stop old microservices
2. Clear port 8080
3. Deploy consolidated system
4. Verify deployment

## 🔄 **Service Mapping**

### **Old → New:**
```
Port 8081 (Auth) → Port 8080/farmtally/auth-service/
Port 8088 (Field) → Port 8080/farmtally/field-manager-service/
Port 8089 (Admin) → Port 8080/farmtally/farm-admin-service/
Port 8090 (Gateway) → Port 8080/farmtally/api-gateway/
No Frontend → Port 8080/farmtally/ (NEW!)
```

The consolidated system provides **the same functionality** but through a **cleaner, more professional architecture**.