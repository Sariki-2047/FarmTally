# FarmTally Git-Based Deployment Script (PowerShell)
# Deploys FarmTally using Git for version control

param(
    [string]$VpsHost = "147.93.153.247",
    [string]$VpsUser = "root",
    [string]$ProjectDir = "/opt/farmtally",
    [string]$ComposeFile = "docker-compose.consolidated.yml"
)

Write-Host "🚀 FarmTally Git-Based Deployment Starting..." -ForegroundColor Cyan

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "[ERROR] Not in a git repository. Please initialize git first:" -ForegroundColor Red
    Write-Host "  git init" -ForegroundColor Yellow
    Write-Host "  git add ." -ForegroundColor Yellow
    Write-Host "  git commit -m 'Initial commit'" -ForegroundColor Yellow
    exit 1
}

# Check for uncommitted changes
try {
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "[WARNING] You have uncommitted changes. Commit them first:" -ForegroundColor Yellow
        Write-Host "  git add ." -ForegroundColor Yellow
        Write-Host "  git commit -m 'Your commit message'" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "[ERROR] Failed to check git status" -ForegroundColor Red
    exit 1
}

# Get current commit info
try {
    $commitHash = git rev-parse --short HEAD
    $branch = git branch --show-current
    Write-Host "[INFO] Deploying commit $commitHash from branch $branch" -ForegroundColor Blue
} catch {
    Write-Host "[ERROR] Failed to get git information" -ForegroundColor Red
    exit 1
}

# Check if VPS has git repository
Write-Host "[INFO] Checking VPS repository status..." -ForegroundColor Blue
$setupScript = @"
if [ ! -d '$ProjectDir/.git' ]; then
    echo 'Git repository not found on VPS. Setting up...'
    mkdir -p $ProjectDir
    cd $ProjectDir
    git init
    echo 'Git repository initialized on VPS'
else
    echo 'Git repository found on VPS'
fi
"@

try {
    ssh -o StrictHostKeyChecking=no "${VpsUser}@${VpsHost}" $setupScript
    Write-Host "[SUCCESS] VPS repository setup completed" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to setup VPS repository: $_" -ForegroundColor Red
    exit 1
}

# Deploy via Git
Write-Host "[INFO] Deploying to VPS via Git..." -ForegroundColor Blue
$deployScript = @"
cd $ProjectDir

echo "📥 Pulling latest changes..."
# Check if we have a remote origin
if git remote get-url origin 2>/dev/null; then
    git pull origin $branch || echo "Pull failed, continuing with local files"
else
    echo "No remote origin configured"
fi

echo "📦 Installing frontend dependencies..."
cd farmtally-frontend
npm ci --production

echo "🏗️ Building frontend..."
npm run build
cd ..

echo "🐳 Stopping existing services..."
docker-compose -f $ComposeFile down || echo "No existing services"

echo "🚀 Starting consolidated FarmTally system..."
docker-compose -f $ComposeFile up -d --build

echo "⏳ Waiting for services to start..."
sleep 30

echo "📊 Checking service status..."
docker-compose -f $ComposeFile ps

echo "✅ Git deployment completed!"
"@

try {
    ssh -o StrictHostKeyChecking=no "${VpsUser}@${VpsHost}" $deployScript
    Write-Host "[SUCCESS] Git deployment completed successfully!" -ForegroundColor Green
    
    # Run health checks
    Write-Host "[INFO] Running health checks..." -ForegroundColor Blue
    Start-Sleep -Seconds 10
    
    # Test main endpoint
    try {
        $response = Invoke-WebRequest -Uri "http://${VpsHost}:8080/health" -TimeoutSec 10 -ErrorAction Stop
        Write-Host "[SUCCESS] Health endpoint is responding (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] Health endpoint check failed" -ForegroundColor Yellow
    }
    
    # Test frontend
    try {
        $response = Invoke-WebRequest -Uri "http://${VpsHost}:8080/farmtally/" -TimeoutSec 10 -ErrorAction Stop
        Write-Host "[SUCCESS] Frontend is accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] Frontend check failed" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🎉 FarmTally Git Deployment Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Deployment Details:" -ForegroundColor Cyan
    Write-Host "   Commit: $commitHash" -ForegroundColor Blue
    Write-Host "   Branch: $branch" -ForegroundColor Blue
    Write-Host "   Time: $(Get-Date)" -ForegroundColor Blue
    Write-Host ""
    Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
    Write-Host "   App: http://${VpsHost}:8080/farmtally/" -ForegroundColor Blue
    Write-Host "   Health: http://${VpsHost}:8080/health" -ForegroundColor Blue
    
} catch {
    Write-Host "[ERROR] Git deployment failed: $_" -ForegroundColor Red
    exit 1
}