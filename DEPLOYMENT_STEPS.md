# FarmTally Deployment Steps - Live Guide

## Server Details
- **IP**: 147.93.153.247
- **App URL**: app.farmtally.in
- **SSH**: Ready

## Step 1: Connect to VPS

**Run this command:**
```bash
ssh root@147.93.153.247
```

Once connected, let me know and we'll proceed to the next step.

## Step 2: Initial System Setup

**Run these commands one by one:**

### Update System
```bash
apt update && apt upgrade -y
```

### Create Application User
```bash
adduser farmtally
# Set a password when prompted
usermod -aG sudo farmtally
```

### Switch to farmtally user
```bash
su - farmtally
```

## Step 3: Install Required Software

### Install Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install other essentials
```bash
sudo apt install -y nginx git certbot python3-certbot-nginx ufw
```

### Install PM2
```bash
sudo npm install -g pm2
```

### Verify installations
```bash
node --version
npm --version
nginx -v
pm2 --version
```

## Step 4: Setup Security

### Configure Firewall
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Step 5: Setup Application Directory

```bash
sudo mkdir -p /var/www/farmtally
sudo chown farmtally:farmtally /var/www/farmtally
cd /var/www/farmtally
```

---

**Start with Step 1 - connect to your VPS and let me know when you're ready for the next step!**