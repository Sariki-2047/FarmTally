# 🔧 Fix FarmTally Database Connection

## 🚨 Issue Identified
The FarmTally services are trying to connect to `postgres:5432` but the actual database container is named `farmtally-postgres` and they're on different Docker networks.

## ✅ Solution Options

### Option 1: Use Existing Database (Recommended)
The `farmtally-db-isolated` database already has the schema and is working.

### Option 2: Fix Network Connection
Connect services to the correct network with the right database name.

### Option 3: Update Environment Variables
Change the DATABASE_URL to point to the correct database.

## 🚀 Quick Fix Commands

### Check which database has the schema:
```bash
# Check farmtally-postgres
ssh root@147.93.153.247 "docker exec farmtally-postgres psql -U farmtally_user -d farmtally -c '\dt'"

# Check farmtally-db-isolated  
ssh root@147.93.153.247 "docker exec farmtally-db-isolated psql -U postgres -d farmtally -c '\dt'"
```

### Fix 1: Update services to use existing database
```bash
# Stop current services
ssh root@147.93.153.247 "cd /opt/farmtally && docker-compose -f docker-compose.backend-only.yml down"

# Update DATABASE_URL to use farmtally-db-isolated
# Then restart services
```

### Fix 2: Create schema in correct database
```bash
# Copy schema to farmtally-postgres
ssh root@147.93.153.247 "docker exec -i farmtally-postgres psql -U farmtally_user -d farmtally < /opt/farmtally/create-database-schema.sql"
```

## 🎯 Recommended Action
Use the existing `farmtally-db-isolated` database since it's already working and has the schema.