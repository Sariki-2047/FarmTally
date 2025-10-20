@echo off
echo 🚀 Starting FarmTally Production Server...

REM Check if .env file exists
if not exist .env (
    echo [WARNING] .env file not found. Creating from example...
    copy .env.example .env
    echo [WARNING] Please update .env file with your production values before continuing.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo [INFO] Installing dependencies...
    npm ci --only=production
)

REM Generate Prisma client
echo [INFO] Generating Prisma client...
npx prisma generate

REM Run database migrations
echo [INFO] Running database migrations...
npx prisma migrate deploy

REM Ask about seeding
set /p seed="Do you want to seed the database with sample data? (y/N): "
if /i "%seed%"=="y" (
    echo [INFO] Seeding database...
    npx tsx prisma/seed-production.ts
)

REM Build the application if dist doesn't exist
if not exist dist (
    echo [INFO] Building application...
    npm run build
)

REM Start the production server
echo [INFO] Starting FarmTally production server...
echo [SUCCESS] 🌐 FarmTally is starting on port %PORT%
echo [INFO] Access your application at: http://localhost:%PORT%

node dist/server.js