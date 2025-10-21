# 🗄️ Database Deployment Options for FarmTally VPS

## Current Setup Analysis

Your FarmTally project currently has **dual database configurations**:

1. **Supabase** (Cloud) - Currently active
   - Schema: `supabase/migrations/20241020_create_farmtally_tables.sql`
   - Frontend connection: `farmtally-frontend/src/lib/supabase.ts`

2. **Prisma + PostgreSQL** (Ready for VPS)
   - Schema: `prisma/schema.prisma`
   - Backend connection: Ready for local PostgreSQL

## 🎯 **Option 1: Hybrid Deployment (Recommended for Quick Start)**

### Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
│   (Next.js)     │    │   (Express)     │    │   (Supabase)    │
│   VPS Server    │    │   VPS Server    │    │   Cloud         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Pros
- ✅ **Quick deployment** - Keep existing Supabase
- ✅ **Automatic backups** - Supabase handles this
- ✅ **Built-in auth** - Supabase auth system
- ✅ **Real-time features** - Supabase subscriptions
- ✅ **Less maintenance** - No database server management

### Cons
- ❌ **External dependency** - Relies on Supabase service
- ❌ **Potential latency** - Network calls to Supabase
- ❌ **Cost** - Supabase pricing for production usage

### Implementation
```bash
# Environment Variables for VPS
NEXT_PUBLIC_SUPABASE_URL=https://qvxcbdglyvzohzdefnet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=https://app.farmtally.in/api
```

---

## 🎯 **Option 2: Full VPS Deployment (Complete Self-Hosted)**

### Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
│   (Next.js)     │    │   (Express)     │    │  (PostgreSQL)   │
│   VPS Server    │    │   VPS Server    │    │   VPS Server    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Pros
- ✅ **Complete control** - Full ownership of data
- ✅ **Better performance** - Local database access
- ✅ **No external dependencies** - Everything on your VPS
- ✅ **Cost effective** - No cloud database fees
- ✅ **Data sovereignty** - Complete data control

### Cons
- ❌ **More maintenance** - Database server management
- ❌ **Backup responsibility** - You handle backups
- ❌ **Higher complexity** - More moving parts

### Implementation Steps

#### 1. Install PostgreSQL on VPS
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE farmtally;
CREATE USER farmtally_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE farmtally TO farmtally_user;
\q
```

#### 2. Update Backend Configuration
```bash
# Environment Variables
DATABASE_URL="postgresql://farmtally_user:your_secure_password@localhost:5432/farmtally"
```

#### 3. Run Database Migration
```bash
# Using Prisma
cd /var/www/farmtally
npm install
npx prisma migrate deploy
npx prisma generate
```

---

## 🚀 **Migration Plan: Supabase to VPS PostgreSQL**

If you choose Option 2, here's how to migrate:

### Step 1: Export Data from Supabase
```bash
# Install Supabase CLI
npm install -g supabase

# Login and export data
supabase login
supabase db dump --db-url "your_supabase_connection_string" > farmtally_backup.sql
```

### Step 2: Import to VPS PostgreSQL
```bash
# Import schema and data
psql -h localhost -U farmtally_user -d farmtally < farmtally_backup.sql
```

### Step 3: Update Application Configuration
```bash
# Update environment variables
DATABASE_URL="postgresql://farmtally_user:password@localhost:5432/farmtally"

# Remove Supabase dependencies (if desired)
npm uninstall @supabase/supabase-js
```

---

## 📋 **Recommended Approach**

### **Phase 1: Hybrid (Immediate)**
1. Deploy frontend + backend to VPS
2. Keep Supabase as database
3. Test everything works
4. Go live quickly

### **Phase 2: Full Migration (Later)**
1. Setup PostgreSQL on VPS
2. Migrate data from Supabase
3. Update configurations
4. Switch over during maintenance window

---

## 🔧 **VPS Database Setup Script**

Here's a complete setup script for Option 2:

```bash
#!/bin/bash
# setup-vps-database.sh

echo "Setting up PostgreSQL for FarmTally..."

# Install PostgreSQL
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE farmtally;
CREATE USER farmtally_user WITH PASSWORD 'FarmTally2024!';
GRANT ALL PRIVILEGES ON DATABASE farmtally TO farmtally_user;
ALTER USER farmtally_user CREATEDB;
\q
EOF

# Configure PostgreSQL for remote connections (if needed)
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf
echo "host all all 0.0.0.0/0 md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf

# Restart PostgreSQL
sudo systemctl restart postgresql

# Create .env file
cat > /var/www/farmtally/.env << EOF
DATABASE_URL="postgresql://farmtally_user:FarmTally2024!@localhost:5432/farmtally"
NODE_ENV=production
PORT=3001
JWT_SECRET=your_jwt_secret_here
EOF

echo "PostgreSQL setup complete!"
echo "Database URL: postgresql://farmtally_user:FarmTally2024!@localhost:5432/farmtally"
```

---

## 🎯 **My Recommendation**

**Start with Option 1 (Hybrid)** for these reasons:

1. **Faster deployment** - Get live quickly
2. **Less risk** - Keep working database
3. **Gradual migration** - Move to full VPS later
4. **Test VPS setup** - Ensure everything else works first

**Then migrate to Option 2** when you're ready for:
- Complete data control
- Better performance
- Cost optimization
- Full self-hosting

Would you like me to create the setup scripts for either option?