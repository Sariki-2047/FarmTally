# 🔧 Portainer Environment Setup Guide

## 🚨 Issue: "No environments available"

You're seeing this because Portainer needs to connect to your Docker environment first.

## 🛠️ Solution: Add Docker Environment

### Method 1: Add Local Docker Environment (Recommended)

1. **In Portainer Dashboard** (where you are now):
   - Look for **"Add Environment"** button or link
   - If not visible, check the left sidebar for **"Environments"**

2. **Add Environment Steps**:
   - Click **"Add Environment"**
   - Select **"Docker Standalone"**
   - Choose **"Socket"** connection type
   - **Name**: `Local Docker`
   - **Docker API URL**: `unix:///var/run/docker.sock`
   - Click **"Add Environment"**

### Method 2: Via Command Line (If UI doesn't work)

```bash
# SSH to your VPS
ssh root@147.93.153.247

# Restart Portainer with proper Docker socket access
docker stop portainer
docker rm portainer

# Start Portainer with Docker socket mounted
docker run -d \
  --name portainer \
  --restart unless-stopped \
  -p 9000:9000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

### Method 3: Check Current Portainer Configuration

```bash
# Check if Portainer has Docker socket access
ssh root@147.93.153.247 "docker inspect portainer | grep -A 10 Mounts"

# Check Docker socket permissions
ssh root@147.93.153.247 "ls -la /var/run/docker.sock"

# Verify Docker is running
ssh root@147.93.153.247 "docker ps"
```

## 🎯 Expected Result After Setup

Once environment is added, you should see:

### **Environments Section**:
- **Local Docker** (or similar name)
- **Status**: Connected ✅
- **Containers**: Shows count of running containers

### **Left Sidebar Should Show**:
- 🏠 **Home**
- 📦 **Containers** 
- 🖼️ **Images**
- 🌐 **Networks**
- 💾 **Volumes**
- 📚 **Stacks**

## 🔍 Troubleshooting

### If Environment Addition Fails:

1. **Check Docker Socket Permissions**:
```bash
ssh root@147.93.153.247 "chmod 666 /var/run/docker.sock"
```

2. **Restart Portainer**:
```bash
ssh root@147.93.153.247 "docker restart portainer"
```

3. **Check Portainer Logs**:
```bash
ssh root@147.93.153.247 "docker logs portainer"
```

### Alternative: Use Docker TCP Connection

If socket doesn't work, try TCP:

1. **Enable Docker TCP** (on VPS):
```bash
# Edit Docker daemon configuration
echo '{"hosts": ["unix:///var/run/docker.sock", "tcp://0.0.0.0:2376"]}' > /etc/docker/daemon.json
systemctl restart docker
```

2. **In Portainer**:
   - **Connection Type**: TCP
   - **Docker API URL**: `tcp://147.93.153.247:2376`

## 🚀 Quick Fix Command

Run this on your VPS to ensure Portainer has proper access:

```bash
ssh root@147.93.153.247 "
# Stop and remove current Portainer
docker stop portainer 2>/dev/null || true
docker rm portainer 2>/dev/null || true

# Start Portainer with proper Docker access
docker run -d \
  --name portainer \
  --restart unless-stopped \
  -p 9000:9000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

echo 'Portainer restarted with Docker access'
echo 'Wait 30 seconds then refresh http://147.93.153.247:9000'
"
```

## ✅ Verification Steps

After adding environment:

1. **Refresh Portainer**: http://147.93.153.247:9000
2. **Check Environments**: Should show "Local Docker" connected
3. **Click on Environment**: Should show Docker containers
4. **Look for FarmTally containers**:
   - `farmtally-postgres`
   - `farmtally-auth-service`
   - `farmtally-field-manager-service`
   - `farmtally-farm-admin-service`
   - `farmtally-api-gateway`

## 🎉 Next Steps

Once environment is connected:

1. **Go to Containers** → See all your FarmTally services
2. **Go to Stacks** → Deploy new FarmTally stack
3. **Go to Images** → Manage Docker images
4. **Go to Networks** → See `farmtally_farmtally-network`
5. **Go to Volumes** → See `farmtally_postgres_data`

---

**The issue is just that Portainer needs to connect to Docker first. Once connected, you'll see all your FarmTally containers!** 🐳