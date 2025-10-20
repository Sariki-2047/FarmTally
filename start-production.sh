#!/bin/bash

# FarmTally Production Startup Script
set -e

echo "🚀 Starting FarmTally Production Server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from example..."
    cp .env.example .env
    print_warning "Please update .env file with your production values before continuing."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm ci --only=production
fi

# Check if Prisma client is generated
print_status "Generating Prisma client..."
npx prisma generate

# Check if database is accessible
print_status "Checking database connection..."
if ! npx prisma db push --accept-data-loss 2>/dev/null; then
    print_error "Database connection failed. Please check your DATABASE_URL in .env"
    exit 1
fi

# Run database migrations
print_status "Running database migrations..."
npx prisma migrate deploy

# Check if we need to seed the database
read -p "Do you want to seed the database with sample data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Seeding database..."
    npx tsx prisma/seed-production.ts
fi

# Build the application if dist doesn't exist
if [ ! -d "dist" ]; then
    print_status "Building application..."
    npm run build
fi

# Start the production server
print_status "Starting FarmTally production server..."
print_success "🌐 FarmTally is starting on port ${PORT:-3000}"
print_status "Access your application at: http://localhost:${PORT:-3000}"

# Start with PM2 if available, otherwise use node directly
if command -v pm2 &> /dev/null; then
    print_status "Starting with PM2..."
    pm2 start dist/server.js --name "farmtally" --max-memory-restart 1G
    pm2 logs farmtally
else
    print_status "Starting with Node.js..."
    node dist/server.js
fi