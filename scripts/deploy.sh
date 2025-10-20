#!/bin/bash

# FarmTally Deployment Script
set -e

echo "🚀 Starting FarmTally Deployment..."

# Configuration
NODE_ENV=${NODE_ENV:-production}
PORT=${PORT:-3000}

echo "📋 Environment: $NODE_ENV"
echo "📋 Port: $PORT"

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is required"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET environment variable is required"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build the application
echo "🔨 Building application..."
npm run build

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database seed (optional)
if [ "$SEED_DATABASE" = "true" ]; then
    echo "🌱 Seeding database..."
    npm run prisma:seed
fi

# Health check
echo "🏥 Running health check..."
timeout 30s bash -c 'until curl -f http://localhost:$PORT/health; do sleep 2; done' || {
    echo "❌ Health check failed"
    exit 1
}

echo "✅ Deployment completed successfully!"
echo "🌐 Application is running on port $PORT"