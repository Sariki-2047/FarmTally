# FarmTally Consolidated Deployment Script (PowerShell)
# Deploys all services on port 8080 with /farmtally/ subdirectory

param(
    [string]$VpsHost = "147.93.153.247",
    [string]$VpsUser = "root",
    [string]$ProjectDir = "/opt/farmtally",
    [string]$ComposeFile = "docker-compose.consolidated.yml"
)

Write-Host "🚀 Starting FarmTally Consolidated Deployment..." -ForegroundColor Cyan

# Check if required files exist
Write-Host "[INFO] Checking required files..." -ForegroundColor Blue

if (-not (Test-Path $ComposeFile)) {
    Write-Host "[ERROR] Docker Compose file not found: $ComposeFile" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "nginx-consolidated.conf")) {
    Write-Host "[ERROR] Nginx configuration file not found: nginx-consolidated.conf" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "farmtally-frontend")) {
    Write-Host "[ERROR] Frontend directory not found: farmtally-frontend" -ForegroundColor Red
    exit 1
}

Write-Host "[SUCCESS] All required files found" -ForegroundColor Green

# Build frontend
Write-Host "[INFO] Building frontend..." -ForegroundColor Blue
try {
    Set-Location farmtally-frontend
    npm ci
    npm run build
    Set-Location ..
    Write-Host "[SUCCESS] Frontend built successfully" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Frontend build failed: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Copy files to VPS
Write-Host "[INFO] Copying files to VPS..." -ForegroundColor Blue
try {
    scp -o StrictHostKeyChecking=no $ComposeFile "${VpsUser}@${VpsHost}:${ProjectDir}/"
    scp -o StrictHostKeyChecking=no "nginx-consolidated.conf" "${VpsUser}@${VpsHost}:${ProjectDir}/"
    Write-Host "[SUCCESS] Configuration files copied to VPS" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to copy files to VPS: $_" -ForegroundColor Red
    exit 1
}

# Sync project files (excluding large directories)
Write-Host "[INFO] Syncing project files..." -ForegroundColor Blue
try {
    # Use rsync to sync files, excluding unnecessary directories
    $excludeArgs = @(
        "--exclude=node_modules",
        "--exclude=.git", 
        "--exclude=farmtally_frontend",
        "--exclude=.next",
        "--exclude=out"
    )
    
    rsync -avz $excludeArgs "./" "${VpsUser}@${VpsHost}:${ProjectDir}/"
    Write-Host "[SUCCESS] Project files synced to VPS" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Rsync failed, trying alternative method..." -ForegroundColor Yellow
    # Alternative: copy essential files individually
    scp -r -o StrictHostKeyChecking=no "services" "${VpsUser}@${VpsHost}:${ProjectDir}/"
    scp -r -o StrictHostKeyChecking=no "farmtally-frontend" "${VpsUser}@${VpsHost}:${ProjectDir}/"
}

# Deploy on VPS
Write-Host "[INFO] Deploying on VPS..." -ForegroundColor Blue
$deployScript = @"
cd $ProjectDir

echo "Stopping existing services..."
docker-compose -f $ComposeFile down || echo "No existing services to stop"

echo "Cleaning up old containers and images..."
docker system prune -f

echo "Starting FarmTally consolidated system..."
docker-compose -f $ComposeFile up -d --build

echo "Waiting for services to start..."
sleep 30

echo "Checking service status..."
docker-compose -f $ComposeFile ps
"@

try {
    ssh -o StrictHostKeyChecking=no "${VpsUser}@${VpsHost}" $deployScript
    Write-Host "[SUCCESS] Deployment completed" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Deployment failed: $_" -ForegroundColor Red
    exit 1
}

# Health checks
Write-Host "[INFO] Performing health checks..." -ForegroundColor Blue
Start-Sleep -Seconds 10

# Test main endpoint
try {
    $response = Invoke-WebRequest -Uri "http://${VpsHost}:8080/health" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "[SUCCESS] Main endpoint is healthy (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Main endpoint health check failed" -ForegroundColor Yellow
}

# Test frontend
try {
    $response = Invoke-WebRequest -Uri "http://${VpsHost}:8080/farmtally/" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "[SUCCESS] Frontend is accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Frontend health check failed" -ForegroundColor Yellow
}

# Test API services
$services = @("api-gateway", "auth-service", "field-manager-service", "farm-admin-service")
foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri "http://${VpsHost}:8080/farmtally/$service/health" -TimeoutSec 10 -ErrorAction Stop
        Write-Host "[SUCCESS] $service is healthy (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] $service health check failed" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 FarmTally Consolidated Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "🌐 FarmTally App: http://${VpsHost}:8080/farmtally/" -ForegroundColor Blue
Write-Host "🔍 Health Check: http://${VpsHost}:8080/health" -ForegroundColor Blue
Write-Host ""
Write-Host "API Endpoints:" -ForegroundColor Cyan
Write-Host "🚪 API Gateway: http://${VpsHost}:8080/farmtally/api-gateway/" -ForegroundColor Blue
Write-Host "🔐 Auth Service: http://${VpsHost}:8080/farmtally/auth-service/" -ForegroundColor Blue
Write-Host "👨‍🌾 Field Manager: http://${VpsHost}:8080/farmtally/field-manager-service/" -ForegroundColor Blue
Write-Host "🏢 Farm Admin: http://${VpsHost}:8080/farmtally/farm-admin-service/" -ForegroundColor Blue
Write-Host ""
Write-Host "Default Login:" -ForegroundColor Cyan
Write-Host "📧 Email: admin@farmtally.com" -ForegroundColor Blue
Write-Host "🔑 Password: Admin123!" -ForegroundColor Blue