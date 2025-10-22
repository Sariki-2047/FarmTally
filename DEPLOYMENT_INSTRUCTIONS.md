# 🚀 FarmTally Frontend Deployment Instructions

## ✅ **PREPARATION COMPLETE**

Your frontend has been successfully built and deployment files are ready:
- ✅ **Frontend Build**: Production-optimized build created
- ✅ **Nginx Config**: `nginx-farmtally.conf` generated
- ✅ **Deploy Script**: `deploy-to-vps.sh` created

## 📦 **FILES TO UPLOAD**

The following files need to be uploaded to your VPS:
```
farmtally-frontend/out/          # Built frontend files
nginx-farmtally.conf             # Nginx configuration
deploy-to-vps.sh                 # Deployment script
```

## 🚀 **DEPLOYMENT METHODS**

### **Method 1: Using SCP (Recommended)**
```bash
# Upload frontend files
scp -r farmtally-frontend/out root@147.93.153.247:/root/farmtally-frontend-build

# Upload configuration files
scp nginx-farmtally.conf root@147.93.153.247:/root/
scp deploy-to-vps.sh root@147.93.153.247:/root/
```

### **Method 2: Using SFTP**
```bash
# Connect via SFTP
sftp root@147.93.153.247

# Upload files
put -r farmtally-frontend/out farmtally-frontend-build
put nginx-farmtally.conf
put deploy-to-vps.sh
```

### **Method 3: Using WinSCP (Windows GUI)**
1. Open WinSCP
2. Connect to `147.93.153.247` as `root`
3. Upload `farmtally-frontend/out` folder as `farmtally-frontend-build`
4. Upload `nginx-farmtally.conf` and `deploy-to-vps.sh`

## 🔧 **TASK 1.2: Configure Nginx**

After uploading files, SSH to your VPS and run:

```bash
# SSH to VPS
ssh root@147.93.153.247

# Make script executable
chmod +x deploy-to-vps.sh

# Run deployment script
./deploy-to-vps.sh
```

## 📋 **MANUAL DEPLOYMENT STEPS** (If script fails)

If the automated script doesn't work, run these commands manually:

```bash
# 1. Create web directory
mkdir -p /var/www/farmtally

# 2. Copy frontend files
cp -r farmtally-frontend-build/* /var/www/farmtally/

# 3. Set permissions
chown -R www-data:www-data /var/www/farmtally
chmod -R 755 /var/www/farmtally

# 4. Configure Nginx
cp nginx-farmtally.conf /etc/nginx/sites-available/farmtally
ln -sf /etc/nginx/sites-available/farmtally /etc/nginx/sites-enabled/farmtally

# 5. Remove default site
rm -f /etc/nginx/sites-enabled/default

# 6. Test Nginx configuration
nginx -t

# 7. Restart Nginx
systemctl restart nginx
systemctl enable nginx
```

## 🎯 **TASK 1.3: Test Production Deployment**

After deployment, test these URLs:

### **Main Application**
```
http://147.93.153.247/
```

### **API Test Page**
```
http://147.93.153.247/test-api
```

### **Individual Services** (via Nginx proxy)
```
http://147.93.153.247/api/          # API Gateway
http://147.93.153.247/auth/         # Auth Service
http://147.93.153.247/field-manager/ # Field Manager
http://147.93.153.247/farm-admin/   # Farm Admin
```

### **Direct Service Access** (bypass Nginx)
```
http://147.93.153.247:8090/         # API Gateway Direct
http://147.93.153.247:8081/health   # Auth Service Direct
http://147.93.153.247:8088/health   # Field Manager Direct
http://147.93.153.247:8089/health   # Farm Admin Direct
```

## ✅ **SUCCESS INDICATORS**

Your deployment is successful when:
- ✅ Main page loads at `http://147.93.153.247/`
- ✅ Test API page shows all services connected
- ✅ Nginx is serving static files correctly
- ✅ API proxy routes are working
- ✅ All microservices respond through Nginx

## 🚨 **TROUBLESHOOTING**

### **If Nginx fails to start:**
```bash
# Check Nginx configuration
nginx -t

# Check Nginx status
systemctl status nginx

# View Nginx logs
tail -f /var/log/nginx/error.log
```

### **If frontend doesn't load:**
```bash
# Check file permissions
ls -la /var/www/farmtally/

# Check Nginx access logs
tail -f /var/log/nginx/access.log
```

### **If API routes don't work:**
```bash
# Test microservices directly
curl http://localhost:8090/
curl http://localhost:8081/health
curl http://localhost:8088/health
curl http://localhost:8089/health
```

## 🎉 **EXPECTED RESULT**

After successful deployment, you'll have:
- ✅ **Complete FarmTally application** accessible via web browser
- ✅ **All microservices** integrated behind Nginx reverse proxy
- ✅ **Production-ready deployment** with proper routing
- ✅ **API test interface** for verifying connectivity

---

**Ready to proceed with the deployment?**

**Next Steps:**
1. **Upload files** using your preferred method
2. **SSH to VPS** and run the deployment script
3. **Test the application** using the provided URLs
4. **Verify all services** are working correctly

**Your FarmTally application is ready to go live!** 🌾🚀