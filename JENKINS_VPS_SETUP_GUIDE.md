# Jenkins VPS Setup Guide for FarmTally

## Infrastructure Details
- **VPS IP**: 147.93.153.247
- **Jenkins**: http://147.93.153.247:8080
- **Docker/Portainer**: http://147.93.153.247:9000
- **Repository**: https://github.com/Sariki-2047/FarmTally.git

## Step-by-Step Jenkins Configuration

### 1. Access Jenkins Dashboard
1. Open http://147.93.153.247:8080
2. Navigate to the empty "FarmTally" folder
3. Click "New Item" or "Create a job"

### 2. Create Pipeline Job
1. **Job Name**: `farmtally-pipeline`
2. **Type**: Pipeline
3. **Description**: FarmTally CI/CD Pipeline

### 3. Configure Source Code Management
```
Repository URL: https://github.com/Sariki-2047/FarmTally.git
Branch: */main
Credentials: Add GitHub credentials if private repo
```

### 4. Pipeline Configuration
**Pipeline Definition**: Pipeline script from SCM
**SCM**: Git
**Repository URL**: https://github.com/Sariki-2047/FarmTally.git
**Script Path**: Jenkinsfile

### 5. Build Triggers
- [x] GitHub hook trigger for GITScm polling
- [x] Poll SCM: `H/5 * * * *` (every 5 minutes)

### 6. Environment Variables Setup
Add these in Jenkins > Manage Jenkins > Configure System > Global Properties:

```bash
NODE_ENV=production
VPS_HOST=147.93.153.247
DATABASE_URL=postgresql://farmtally:password@localhost:5432/farmtally
JWT_SECRET=your_jwt_secret_here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
DOCKER_HOST=tcp://147.93.153.247:2376
```

## Quick Deployment Commands

### Option 1: Automated Jenkins Deployment
```bash
# Trigger Jenkins build
curl -X POST http://147.93.153.247:8080/job/FarmTally/job/farmtally-pipeline/build \
  --user admin:your_jenkins_token
```

### Option 2: Manual VPS Setup
```bash
# SSH to VPS
ssh root@147.93.153.247

# Download and run setup script
wget https://raw.githubusercontent.com/Sariki-2047/FarmTally/main/scripts/setup-vps-manual.sh
chmod +x setup-vps-manual.sh
sudo ./setup-vps-manual.sh
```

### Option 3: Docker Deployment via Portainer
1. Access http://147.93.153.247:9000
2. Create new stack named "farmtally"
3. Use the docker-compose.yml from repository
4. Deploy stack

## Jenkins Pipeline Features

### Automated Stages
1. **Checkout**: Pull latest code from GitHub
2. **Install**: Install Node.js dependencies
3. **Test**: Run unit and integration tests
4. **Build**: Build frontend and backend
5. **Docker**: Create Docker images
6. **Deploy**: Deploy to VPS containers
7. **Health Check**: Verify deployment success
8. **Notify**: Send deployment notifications

### Rollback Capability
```bash
# Trigger rollback job
curl -X POST http://147.93.153.247:8080/job/FarmTally/job/rollback-job/build \
  --user admin:your_jenkins_token \
  --data "VERSION=previous"
```

## Monitoring and Logs

### Application Logs
```bash
# Backend logs
sudo journalctl -u farmtally-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Docker logs
docker logs farmtally-backend -f
docker logs farmtally-frontend -f
```

### Health Checks
- **Application**: http://147.93.153.247/health
- **API**: http://147.93.153.247/api/health
- **Jenkins**: http://147.93.153.247:8080/manage
- **Docker**: http://147.93.153.247:9000

## Security Configuration

### Firewall Rules
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8080/tcp  # Jenkins
sudo ufw allow 9000/tcp  # Portainer
sudo ufw enable
```

### SSL Certificate (Optional)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Troubleshooting

### Common Issues
1. **Port conflicts**: Check if ports 80, 3000, 8080, 9000 are available
2. **Permission errors**: Ensure farmtally user has proper permissions
3. **Database connection**: Verify PostgreSQL is running and accessible
4. **Memory issues**: Monitor VPS resources with `htop`

### Debug Commands
```bash
# Check service status
sudo systemctl status farmtally-backend
sudo systemctl status nginx

# Check Docker containers
docker ps -a
docker logs container_name

# Check network connectivity
curl http://localhost:3000/health
curl http://147.93.153.247/health
```

## Next Steps After Setup

1. **Configure Environment Variables**: Update `.env` file with production values
2. **Set Up Database**: Initialize PostgreSQL or configure Supabase
3. **Configure Email**: Set up SMTP for notifications
4. **Domain Setup**: Point domain to VPS IP
5. **SSL Certificate**: Enable HTTPS
6. **Monitoring**: Set up application monitoring
7. **Backups**: Configure automated backups

## Support Commands

### Restart Services
```bash
sudo systemctl restart farmtally-backend
sudo systemctl restart nginx
docker-compose restart
```

### Update Application
```bash
cd /opt/farmtally
sudo -u farmtally ./deploy.sh
```

### View Application Status
```bash
curl http://147.93.153.247/health
curl http://147.93.153.247/api/health
```