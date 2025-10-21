#!/bin/bash
# FarmTally VPS Database Setup Script
# This script sets up PostgreSQL on your VPS for complete self-hosting

set -e

echo "🗄️ Setting up PostgreSQL for FarmTally VPS deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install PostgreSQL
print_status "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib postgresql-client

# Start and enable PostgreSQL
print_status "Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Generate secure password
DB_PASSWORD=$(openssl rand -base64 32)
print_status "Generated secure database password"

# Create database and user
print_status "Creating FarmTally database and user..."
sudo -u postgres psql << EOF
-- Create database
CREATE DATABASE farmtally;

-- Create user with secure password
CREATE USER farmtally_user WITH PASSWORD '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE farmtally TO farmtally_user;
ALTER USER farmtally_user CREATEDB;

-- Grant schema privileges
\c farmtally
GRANT ALL ON SCHEMA public TO farmtally_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO farmtally_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO farmtally_user;

-- Exit
\q
EOF

# Configure PostgreSQL for local connections
print_status "Configuring PostgreSQL..."

# Backup original config
sudo cp /etc/postgresql/*/main/postgresql.conf /etc/postgresql/*/main/postgresql.conf.backup
sudo cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup

# Configure listen addresses (local only for security)
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /etc/postgresql/*/main/postgresql.conf

# Configure authentication
sudo sed -i "s/local   all             all                                     peer/local   all             all                                     md5/" /etc/postgresql/*/main/pg_hba.conf

# Restart PostgreSQL to apply changes
print_status "Restarting PostgreSQL..."
sudo systemctl restart postgresql

# Create application directory if it doesn't exist
sudo mkdir -p /var/www/farmtally
sudo chown $USER:$USER /var/www/farmtally

# Create environment file
print_status "Creating environment configuration..."
cat > /var/www/farmtally/.env.database << EOF
# FarmTally VPS Database Configuration
DATABASE_URL="postgresql://farmtally_user:$DB_PASSWORD@localhost:5432/farmtally"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=farmtally
DB_USER=farmtally_user
DB_PASSWORD=$DB_PASSWORD

# Application Configuration
NODE_ENV=production
PORT=3001
JWT_SECRET=$(openssl rand -base64 64)

# CORS Configuration
CORS_ORIGIN=https://app.farmtally.in
FRONTEND_URL=https://app.farmtally.in
EOF

# Set secure permissions
chmod 600 /var/www/farmtally/.env.database

# Create database initialization script
print_status "Creating database initialization script..."
cat > /var/www/farmtally/init-database.js << 'EOF'
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Check if tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    if (result.rows.length === 0) {
      console.log('No tables found. Database needs initialization.');
      console.log('Run: npm run migrate or npx prisma migrate deploy');
    } else {
      console.log('Database tables found:', result.rows.map(r => r.table_name));
    }

  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config({ path: '/var/www/farmtally/.env.database' });
initializeDatabase();
EOF

# Create backup script
print_status "Creating backup script..."
cat > /var/www/farmtally/backup-database.sh << EOF
#!/bin/bash
# FarmTally Database Backup Script

# Load environment variables
source /var/www/farmtally/.env.database

# Create backup directory
BACKUP_DIR="/var/backups/farmtally"
sudo mkdir -p \$BACKUP_DIR

# Generate backup filename with timestamp
BACKUP_FILE="farmtally_backup_\$(date +%Y%m%d_%H%M%S).sql"

# Create backup
echo "Creating database backup..."
pg_dump "\$DATABASE_URL" > "\$BACKUP_DIR/\$BACKUP_FILE"

# Compress backup
gzip "\$BACKUP_DIR/\$BACKUP_FILE"

echo "Backup created: \$BACKUP_DIR/\$BACKUP_FILE.gz"

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "farmtally_backup_*.sql.gz" -mtime +7 -delete

echo "Old backups cleaned up"
EOF

chmod +x /var/www/farmtally/backup-database.sh

# Create restore script
print_status "Creating restore script..."
cat > /var/www/farmtally/restore-database.sh << 'EOF'
#!/bin/bash
# FarmTally Database Restore Script

if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo "Available backups:"
    ls -la /var/backups/farmtally/farmtally_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

# Load environment variables
source /var/www/farmtally/.env.database

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Restoring database from: $BACKUP_FILE"

# Extract if gzipped
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL"
else
    psql "$DATABASE_URL" < "$BACKUP_FILE"
fi

echo "Database restore completed"
EOF

chmod +x /var/www/farmtally/restore-database.sh

# Setup daily backup cron job
print_status "Setting up daily backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/farmtally/backup-database.sh") | crontab -

# Install Node.js dependencies for database operations
print_status "Installing Node.js database dependencies..."
cd /var/www/farmtally
npm init -y 2>/dev/null || true
npm install pg dotenv prisma @prisma/client 2>/dev/null || true

# Test database connection
print_status "Testing database connection..."
node init-database.js

# Display summary
print_status "PostgreSQL setup completed successfully!"
echo ""
echo "📋 Database Configuration Summary:"
echo "=================================="
echo "Database Name: farmtally"
echo "Database User: farmtally_user"
echo "Database Host: localhost"
echo "Database Port: 5432"
echo ""
echo "🔐 Security Information:"
echo "======================="
echo "Database password has been generated and saved to:"
echo "/var/www/farmtally/.env.database"
echo ""
echo "🔧 Next Steps:"
echo "============="
echo "1. Copy the DATABASE_URL from .env.database to your main .env file"
echo "2. Run database migrations: npx prisma migrate deploy"
echo "3. Generate Prisma client: npx prisma generate"
echo "4. Test your application connection"
echo ""
echo "📁 Useful Scripts Created:"
echo "========================="
echo "• Backup: /var/www/farmtally/backup-database.sh"
echo "• Restore: /var/www/farmtally/restore-database.sh"
echo "• Test Connection: /var/www/farmtally/init-database.js"
echo ""
echo "⏰ Automatic Backups:"
echo "===================="
echo "Daily backups scheduled at 2:00 AM"
echo "Backups stored in: /var/backups/farmtally/"
echo ""

print_warning "IMPORTANT: Save the database password from .env.database file!"
print_warning "The password is: $DB_PASSWORD"

echo ""
print_status "Database setup complete! 🎉"