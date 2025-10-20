#!/bin/bash

# FarmTally Development Startup Script
set -e

echo "🚀 Starting FarmTally Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "📝 Please update .env file with your configuration"
    else
        echo "❌ .env.example file not found"
        exit 1
    fi
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations (development)
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init || echo "⚠️  Migration failed or already exists"

# Start the development server
echo "🔥 Starting development server..."
echo "📡 Backend will be available at: http://localhost:3000"
echo "🏥 Health check: http://localhost:3000/health"
echo "📚 API docs: http://localhost:3000/api/v1"

npm run dev