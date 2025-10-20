# FarmTally Local Database Setup Script
# Run this script after installing PostgreSQL

param(
    [string]$Password = "farmtally123",
    [string]$DatabaseName = "farmtally",
    [string]$Username = "postgres"
)

Write-Host "🐘 FarmTally PostgreSQL Setup Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if PostgreSQL is installed
Write-Host "🔍 Checking PostgreSQL installation..." -ForegroundColor Yellow

try {
    $pgVersion = psql --version
    Write-Host "✅ PostgreSQL found: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL not found. Please install PostgreSQL first." -ForegroundColor Red
    Write-Host "📥 Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    exit 1
}

# Check if PostgreSQL service is running
Write-Host "🔍 Checking PostgreSQL service..." -ForegroundColor Yellow

$service = Get-Service postgresql* -ErrorAction SilentlyContinue
if ($service -and $service.Status -eq "Running") {
    Write-Host "✅ PostgreSQL service is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Starting PostgreSQL service..." -ForegroundColor Yellow
    try {
        Start-Service postgresql*
        Write-Host "✅ PostgreSQL service started" -ForegroundColor Green
    } catch {
        Write-Host "❌ Could not start PostgreSQL service. Please start it manually." -ForegroundColor Red
        exit 1
    }
}

# Test connection to PostgreSQL
Write-Host "🔍 Testing PostgreSQL connection..." -ForegroundColor Yellow

$env:PGPASSWORD = $Password
$testConnection = psql -U $Username -h localhost -c "SELECT version();" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL connection successful" -ForegroundColor Green
} else {
    Write-Host "❌ Could not connect to PostgreSQL." -ForegroundColor Red
    Write-Host "💡 Please check your PostgreSQL password and try again." -ForegroundColor Cyan
    Write-Host "💡 Default username is 'postgres' with the password you set during installation." -ForegroundColor Cyan
    exit 1
}

# Create FarmTally database
Write-Host "🗄️  Creating FarmTally database..." -ForegroundColor Yellow

$createDb = psql -U $Username -h localhost -c "CREATE DATABASE $DatabaseName;" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database '$DatabaseName' created successfully" -ForegroundColor Green
} else {
    # Database might already exist, check if it exists
    $checkDb = psql -U $Username -h localhost -c "\l" | Select-String $DatabaseName
    if ($checkDb) {
        Write-Host "ℹ️  Database '$DatabaseName' already exists" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Could not create database '$DatabaseName'" -ForegroundColor Red
        exit 1
    }
}

# Update .env file
Write-Host "⚙️  Updating .env configuration..." -ForegroundColor Yellow

$databaseUrl = "postgresql://${Username}:${Password}@localhost:5432/${DatabaseName}"
$envContent = Get-Content .env -Raw

# Replace the DATABASE_URL line
$newEnvContent = $envContent -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$databaseUrl`""

Set-Content .env $newEnvContent
Write-Host "✅ .env file updated with database URL" -ForegroundColor Green

# Test database connection with Node.js
Write-Host "🧪 Testing FarmTally database connection..." -ForegroundColor Yellow

$testResult = node test-db-connection.js 2>&1
if ($testResult -match "Database connection successful") {
    Write-Host "✅ FarmTally database connection successful!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database connection test results:" -ForegroundColor Yellow
    Write-Host $testResult -ForegroundColor White
}

# Initialize database
Write-Host "🚀 Initializing FarmTally database..." -ForegroundColor Yellow

Write-Host "   📦 Generating Prisma client..." -ForegroundColor Cyan
npm run generate | Out-Null

Write-Host "   🏗️  Running database migrations..." -ForegroundColor Cyan
npm run migrate | Out-Null

Write-Host "   🌱 Seeding sample data..." -ForegroundColor Cyan
npm run seed | Out-Null

Write-Host "✅ FarmTally database initialization complete!" -ForegroundColor Green

# Final summary
Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host "Database URL: $databaseUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm run dev" -ForegroundColor White
Write-Host "2. Open: http://localhost:3000/health" -ForegroundColor White
Write-Host "3. Test with credentials:" -ForegroundColor White
Write-Host "   - Admin: admin@farmtally.com / Admin123!" -ForegroundColor White
Write-Host "   - Manager: manager@farmtally.com / Manager123!" -ForegroundColor White
Write-Host "   - Farmer: farmer@farmtally.com / Farmer123!" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   - API: API_DOCUMENTATION.md" -ForegroundColor White
Write-Host "   - Testing: TESTING_CHECKLIST.md" -ForegroundColor White
Write-Host "   - Deployment: FARMTALLY_DEPLOYMENT_GUIDE.md" -ForegroundColor White

# Clean up environment variable
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue