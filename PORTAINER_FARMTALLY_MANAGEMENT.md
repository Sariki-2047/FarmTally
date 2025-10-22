# 🐳 FarmTally Docker Management with Portainer

## 🌐 Access Your Docker Management

**Portainer URL**: http://147.93.153.247:9000/

Portainer is your visual Docker management interface - much easier than command line!

## 📊 Current FarmTally Services in Portainer

### How to View Your Services:

1. **Access Portainer**: http://147.93.153.247:9000/
2. **Login** with your Portainer credentials
3. **Click on "Containers"** in the left sidebar
4. **Look for FarmTally containers**:
   - `farmtally-postgres`
   - `farmtally-auth-service`
   - `farmtally-field-manager-service`
   - `farmtally-farm-admin-service`
   - `farmtally-api-gateway`

## 🔍 What You Can Do in Portainer

### 1. **Container Management**
- ✅ **Start/Stop** individual services
- 🔄 **Restart** services when needed
- 📊 **Monitor** resource usage (CPU, Memory)
- 📝 **View logs** for debugging
- 🔧 **Execute commands** inside containers

### 2. **Service Monitoring**
- 🟢 **Green dot** = Service running healthy
- 🔴 **Red dot** = Service stopped/failed
- 📈 **Resource graphs** for performance monitoring
- 📋 **Container details** and configuration

### 3. **Network Management**
- 🌐 View `farmtally_farmtally-network`
- 🔗 See service interconnections
- 🚪 Check port mappings

### 4. **Volume Management**
- 💾 View `farmtally_postgres_data` volume
- 📁 Manage persistent data storage
- 🔄 Backup and restore data

## 🚀 FarmTally Service Management Guide

### Quick Actions in Portainer:

#### **Start All FarmTally Services**
1. Go to **Containers**
2. **Select all** FarmTally containers
3. Click **"Start"** button
4. Wait for all services to show green status

#### **Stop All FarmTally Services**
1. Go to **Containers**
2. **Select all** FarmTally containers
3. Click **"Stop"** button

#### **Restart Individual Service**
1. Find the service (e.g., `farmtally-auth-service`)
2. Click the **container name**
3. Click **"Restart"** button
4. Monitor logs for startup

#### **View Service Logs**
1. Click on **container name**
2. Go to **"Logs"** tab
3. See real-time service output
4. Use for debugging issues

#### **Check Service Health**
1. Click on **container name**
2. Go to **"Stats"** tab
3. Monitor CPU, Memory, Network usage
4. Check if service is responding

## 📋 FarmTally Service Status Check

### Expected Running Containers:
```
Container Name                    Status    Ports
farmtally-postgres               Running   5432:5432
farmtally-auth-service           Running   8081:8081
farmtally-field-manager-service  Running   8088:8088
farmtally-farm-admin-service     Running   8089:8089
farmtally-api-gateway            Running   8090:8080
```

### Health Check URLs (Test in Browser):
- **API Gateway**: http://147.93.153.247:8090/health
- **Auth Service**: http://147.93.153.247:8081/health
- **Field Manager**: http://147.93.153.247:8088/health
- **Farm Admin**: http://147.93.153.247:8089/health

## 🔧 Troubleshooting with Portainer

### If a Service is Down:
1. **Check Container Status** in Portainer
2. **View Logs** for error messages
3. **Restart Container** if needed
4. **Check Resource Usage** (memory/CPU limits)

### Common Issues:

#### **Port Conflicts**
- Look for "Port already in use" in logs
- Check port mappings in container details
- Stop conflicting containers

#### **Database Connection Issues**
- Ensure `farmtally-postgres` is running
- Check database logs in Portainer
- Verify network connectivity between services

#### **Memory Issues**
- Monitor memory usage in Stats tab
- Restart containers if memory is high
- Check for memory leaks in logs

## 🎯 Portainer Best Practices for FarmTally

### 1. **Regular Monitoring**
- Check container status daily
- Monitor resource usage trends
- Review logs for errors

### 2. **Backup Management**
- Use Portainer to backup volumes
- Export container configurations
- Document service dependencies

### 3. **Update Management**
- Stop services before updates
- Update one service at a time
- Test after each update

### 4. **Security**
- Regularly update container images
- Monitor network connections
- Review container permissions

## 🚀 Deploy New FarmTally Services via Portainer

### Method 1: Using Stacks (Recommended)
1. Go to **"Stacks"** in Portainer
2. Click **"Add Stack"**
3. **Name**: `farmtally-microservices`
4. **Paste Docker Compose content**:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    container_name: farmtally-postgres
    environment:
      POSTGRES_DB: farmtally
      POSTGRES_USER: farmtally_user
      POSTGRES_PASSWORD: farmtally_password_2024
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - farmtally-network
    restart: unless-stopped

  auth-service:
    build:
      context: /opt/farmtally
      dockerfile: services/auth-service/Dockerfile
    container_name: farmtally-auth-service
    ports:
      - "8081:8081"
    environment:
      - NODE_ENV=production
      - PORT=8081
      - DATABASE_URL=postgresql://farmtally_user:farmtally_password_2024@postgres:5432/farmtally
    depends_on:
      - postgres
    networks:
      - farmtally-network
    restart: unless-stopped

networks:
  farmtally-network:
    driver: bridge

volumes:
  postgres_data:
```

5. Click **"Deploy the stack"**

### Method 2: Individual Containers
1. Go to **"Containers"**
2. Click **"Add Container"**
3. Configure each service individually
4. Set up networks and volumes

## 📊 Monitoring Dashboard in Portainer

### Key Metrics to Watch:
- **CPU Usage**: Should be < 80%
- **Memory Usage**: Should be < 90%
- **Network I/O**: Monitor for unusual spikes
- **Container Uptime**: Track service reliability

### Alerts Setup:
1. Go to **"Notifications"**
2. Set up **webhook alerts**
3. Configure for:
   - Container failures
   - High resource usage
   - Network issues

## 🔗 Integration with Jenkins

### Portainer API for Jenkins:
```groovy
// Jenkins Pipeline to deploy via Portainer API
pipeline {
    agent any
    stages {
        stage('Deploy via Portainer') {
            steps {
                script {
                    // Use Portainer API to deploy stack
                    sh '''
                        curl -X POST "http://147.93.153.247:9000/api/stacks" \
                        -H "Authorization: Bearer YOUR_PORTAINER_TOKEN" \
                        -F "Name=farmtally-microservices" \
                        -F "StackFileContent=@docker-compose.backend-only.yml"
                    '''
                }
            }
        }
    }
}
```

## 🎉 Quick Start Checklist

### ✅ Daily Operations:
1. **Open Portainer**: http://147.93.153.247:9000/
2. **Check all containers** are running (green status)
3. **Review logs** for any errors
4. **Monitor resource usage**
5. **Test service endpoints**

### 🚨 Emergency Procedures:
1. **Service Down**: Restart via Portainer
2. **High Memory**: Check logs and restart
3. **Database Issues**: Check postgres container
4. **Network Problems**: Restart entire stack

---

## 🌟 **Portainer Advantages for FarmTally:**

- **Visual Management**: No command line needed
- **Real-time Monitoring**: Live stats and logs
- **Easy Deployment**: Drag-and-drop Docker Compose
- **Team Collaboration**: Multiple users can manage
- **Backup & Restore**: Built-in data management
- **Security**: Role-based access control

**Your FarmTally microservices are now easily manageable through the beautiful Portainer interface!** 🎯