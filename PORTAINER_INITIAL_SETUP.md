# 🚀 Portainer Initial Setup Guide

## 🔍 Current Issue
You're seeing "Invalid username" errors because Portainer needs initial admin setup.

## ✅ Step-by-Step Setup

### **Step 1: Access Portainer Setup**
1. **Go to**: http://147.93.153.247:9000/
2. **You should see**: "Create the first administrator user" page
3. **If you see login page instead**: The admin user might already exist

### **Step 2: Create Admin User (First Time)**
If you see the setup page:
- **Username**: `admin`
- **Password**: `FarmTally2024!` (or your preferred password)
- **Confirm Password**: `FarmTally2024!`
- **Click**: "Create user"

### **Step 3: Add Docker Environment**
After creating admin user:
1. **Select**: "Get Started"
2. **Choose**: "Docker Standalone"
3. **Environment name**: `Local Docker`
4. **Environment URL**: `unix:///var/run/docker.sock`
5. **Click**: "Connect"

### **Step 4: Verify Connection**
You should now see:
- **Left sidebar**: Home, Containers, Images, Networks, etc.
- **Environment**: "Local Docker" connected
- **Containers**: Your FarmTally services

## 🔧 Alternative: Reset Portainer (If Setup Issues)

If you're stuck in login loop or having issues:

```bash
# SSH to VPS
ssh root@147.93.153.247

# Stop and remove Portainer
docker stop portainer
docker rm portainer

# Remove Portainer data (this resets everything)
docker volume rm portainer_data

# Start fresh Portainer
docker run -d \
  --name portainer \
  --restart unless-stopped \
  -p 9000:9000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

# Wait 30 seconds then go to http://147.93.153.247:9000/
```

## 🎯 Expected Result

After successful setup, you should see:

### **Dashboard View**:
- **Environments**: 1 connected
- **Containers**: Shows count of running containers
- **Images**: Shows Docker images
- **Volumes**: Shows data volumes

### **FarmTally Containers**:
- `farmtally-postgres` ✅
- `farmtally-auth-service` ✅
- `farmtally-field-manager-service` ✅
- `farmtally-farm-admin-service` ✅
- `farmtally-api-gateway` ✅

### **Left Sidebar Menu**:
- 🏠 **Home**
- 📦 **Containers**
- 🖼️ **Images**
- 🌐 **Networks**
- 💾 **Volumes**
- 📚 **Stacks**

## 🚨 Troubleshooting

### **Issue: Can't Access Setup Page**
```bash
# Check if Portainer is running
ssh root@147.93.153.247 "docker ps | grep portainer"

# Check Portainer logs
ssh root@147.93.153.247 "docker logs portainer"

# Restart Portainer
ssh root@147.93.153.247 "docker restart portainer"
```

### **Issue: "Invalid username" Errors**
- This happens when trying to login without completing setup
- **Solution**: Complete the initial admin user creation first

### **Issue: No Docker Environment**
- After login, you need to add Docker environment
- **Solution**: Follow Step 3 above to connect to local Docker

## 🔑 Default Credentials (After Setup)
- **Username**: `admin`
- **Password**: `FarmTally2024!` (or what you set)
- **URL**: http://147.93.153.247:9000/

## ⚡ Quick Reset Command

Run this if you want to start completely fresh:

```bash
ssh root@147.93.153.247 "
docker stop portainer 2>/dev/null || true
docker rm portainer 2>/dev/null || true
docker volume rm portainer_data 2>/dev/null || true
docker run -d --name portainer --restart unless-stopped -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest
echo 'Portainer reset complete. Go to http://147.93.153.247:9000/ in 30 seconds'
"
```

---

**The key is completing the initial admin user setup first, then adding the Docker environment!** 🎯