# Contabo VPS Requirements and Setup

## What You Need from Contabo

### 1. VPS Specifications
**Recommended Plan:**
- **VPS S SSD** or higher
- **4 GB RAM** minimum (8 GB recommended)
- **100 GB SSD** storage minimum
- **Unlimited traffic**
- **1 vCPU** minimum (2 vCPU recommended)

### 2. Operating System
- **Ubuntu 22.04 LTS** (recommended)
- Or **Ubuntu 20.04 LTS**
- Avoid Windows Server (more expensive and complex)

### 3. Additional Services Needed
- **Domain name** (can buy from Contabo or external provider like Namecheap)
- **SSH key pair** for secure access

## Step-by-Step Contabo Setup

### Step 1: Order Your VPS
1. Go to [Contabo.com](https://contabo.com)
2. Navigate to **VPS** section
3. Choose **VPS S SSD** or **VPS M SSD**
4. Select **Ubuntu 22.04 LTS** as operating system
5. Choose your data center location (closest to your users)
6. Add SSH key if you have one, or use password authentication
7. Complete the order

### Step 2: Domain Setup
**Option A: Buy domain from Contabo**
1. Add domain service during VPS order
2. They'll handle DNS setup automatically

**Option B: Use external domain (Namecheap, GoDaddy, etc.)**
1. Buy domain from your preferred provider
2. Point domain to your VPS IP (we'll get this after VPS is ready)

### Step 3: Initial Access Information
After ordering, Contabo will email you:
- **Server IP address**
- **Root password** (if not using SSH keys)
- **SSH access details**

## Pre-Deployment Checklist

### Information You'll Need
- [ ] VPS IP address
- [ ] Root password or SSH private key
- [ ] Domain name
- [ ] Supabase project URL and keys
- [ ] Gmail app password for email notifications

### Local Preparation
- [ ] SSH client installed (PuTTY for Windows, or built-in terminal for Mac/Linux)
- [ ] Your project code ready
- [ ] Environment variables documented

## Quick Start Commands

Once you have your VPS details, here's what we'll do:

### 1. Connect to Your VPS
```bash
# Replace YOUR_VPS_IP with actual IP
ssh root@YOUR_VPS_IP
```

### 2. Update System
```bash
apt update && apt upgrade -y
```

### 3. Create Non-Root User
```bash
adduser farmtally
usermod -aG sudo farmtally
```

### 4. Setup SSH Key (if needed)
```bash
# On your local machine, generate SSH key
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy public key to server
ssh-copy-id farmtally@YOUR_VPS_IP
```

## Domain DNS Configuration

### If Using External Domain Provider
You'll need to create these DNS records:

**A Records:**
```
Type: A
Name: @
Value: YOUR_VPS_IP
TTL: 3600

Type: A  
Name: www
Value: YOUR_VPS_IP
TTL: 3600
```

**Example for Namecheap:**
1. Login to Namecheap account
2. Go to Domain List → Manage
3. Advanced DNS tab
4. Add the A records above

## Security Setup (We'll do this together)

### 1. Firewall Configuration
```bash
# Install and configure UFW
sudo apt install ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. SSH Security
```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Change these settings:
# PermitRootLogin no
# PasswordAuthentication no (if using SSH keys)
# Port 2222 (optional: change default port)

# Restart SSH
sudo systemctl restart ssh
```

## What We'll Install Together

### Core Software Stack
- **Node.js 18+** - Runtime for backend
- **Nginx** - Web server and reverse proxy
- **PM2** - Process manager
- **Docker** - Containerization (optional)
- **Certbot** - SSL certificates
- **Git** - Version control

### Application Components
- **Express.js Backend** - API server
- **Next.js Frontend** - Web application
- **Database Connection** - Supabase integration

## Estimated Timeline

### Phase 1: VPS Setup (30 minutes)
- Server provisioning
- Initial configuration
- Security setup

### Phase 2: Software Installation (45 minutes)
- Install all required software
- Configure services
- Setup firewall

### Phase 3: Application Deployment (60 minutes)
- Clone and setup code
- Configure environment variables
- Build and deploy applications

### Phase 4: Domain and SSL (30 minutes)
- Configure Nginx
- Setup SSL certificates
- Test everything

**Total Time: ~2.5 hours**

## Cost Breakdown (Monthly)

### Contabo VPS S SSD
- **VPS**: €4.99/month
- **Domain** (if from Contabo): €1.50/month
- **Total**: ~€6.50/month (~$7 USD)

### External Domain (Optional)
- **Namecheap .com**: ~$12/year
- **Total with external domain**: ~€5.99/month + $12/year

## Next Steps

1. **Order your VPS** from Contabo with Ubuntu 22.04 LTS
2. **Get a domain name** (either from Contabo or external provider)
3. **Wait for setup email** with IP address and credentials
4. **Let me know when ready** and we'll start the deployment process

## Common Questions

**Q: Can I use a smaller VPS?**
A: VPS XS might work for testing, but 4GB RAM is recommended for production.

**Q: Which data center should I choose?**
A: Choose the one closest to your users (Europe, US East, US West, Asia).

**Q: Do I need a domain immediately?**
A: You can start with IP address, but domain is needed for SSL certificates.

**Q: Can I upgrade later?**
A: Yes, Contabo allows easy upgrades to larger plans.

Ready to proceed? Let me know when you have:
1. ✅ VPS ordered and IP received
2. ✅ Domain name ready
3. ✅ SSH access working

Then we'll start the actual deployment!