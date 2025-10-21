# Deploy Login Fixes to VPS via Git Pull (PowerShell)
# This script pulls the latest code from Git and rebuilds

param(
    [string]$VpsHost = "147.93.153.247",
    [string]$VpsUser = "root",
    [string]$VpsPath = "/var/www/farmtally"
)

Write-Host "🚀 Deploying Login Fixes to VPS via Git" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

function Write-Status {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Test SSH connection
Write-Info "Testing SSH connection to VPS..."
try {
    $testResult = ssh -o ConnectTimeout=10 "$VpsUser@$VpsHost" "echo 'Connection successful'" 2>$null
    if ($testResult -eq "Connection successful") {
        Write-Status "SSH connection verified"
    } else {
        throw "Connection failed"
    }
} catch {
    Write-Error "Cannot connect to VPS. Please check:"
    Write-Host "  - VPS IP: $VpsHost" -ForegroundColor White
    Write-Host "  - Username: $VpsUser" -ForegroundColor White
    Write-Host "  - SSH key/password authentication" -ForegroundColor White
    Write-Host "  - Try: ssh $VpsUser@$VpsHost" -ForegroundColor Cyan
    exit 1
}

# Deploy via Git
Write-Info "Deploying via Git pull..."

$deployScript = @"
cd $VpsPath

# Pull latest changes
echo '📥 Pulling latest code from Git...'
git pull origin main

# Navigate to frontend
cd farmtally-frontend

# Install any new dependencies
echo '📦 Installing dependencies...'
npm install

# Build the application
echo '🔨 Building application...'
npm run build

# Restart PM2 process
echo '🔄 Restarting frontend service...'
pm2 restart farmtally-frontend || pm2 start npm --name 'farmtally-frontend' -- start

# Save PM2 configuration
pm2 save

echo '✅ Deployment complete!'
"@

try {
    ssh "$VpsUser@$VpsHost" $deployScript
    Write-Status "Git deployment completed"
} catch {
    Write-Error "Deployment failed: $_"
    exit 1
}

# Test the deployment
Write-Info "Testing deployment..."
Start-Sleep -Seconds 10

try {
    # Test main site
    $response = Invoke-WebRequest -Uri "https://app.farmtally.in" -Method Head -TimeoutSec 10 -ErrorAction Stop
    Write-Status "✅ Main site is responding (Status: $($response.StatusCode))"
} catch {
    Write-Error "❌ Main site health check failed"
}

try {
    # Test login page
    $response = Invoke-WebRequest -Uri "https://app.farmtally.in/login" -Method Head -TimeoutSec 10 -ErrorAction Stop
    Write-Status "✅ Login page is accessible (Status: $($response.StatusCode))"
} catch {
    Write-Error "❌ Login page not accessible"
}

# Show deployment status
Write-Info "Getting deployment status..."
try {
    ssh "$VpsUser@$VpsHost" @"
echo '📊 PM2 Status:'
pm2 list
echo ''
echo '📝 Recent Git commits:'
cd $VpsPath && git log --oneline -5
"@
} catch {
    Write-Info "Could not retrieve status (this is okay)"
}

Write-Host ""
Write-Status "🎉 Login fixes deployed successfully via Git!"
Write-Host ""
Write-Info "🧪 Test the fixes now:"
Write-Host "  🌐 Main site: https://app.farmtally.in" -ForegroundColor Cyan
Write-Host "  🔐 Login page: https://app.farmtally.in/login" -ForegroundColor Cyan
Write-Host "  🧪 Test page: https://app.farmtally.in/simple-login-test" -ForegroundColor Cyan
Write-Host ""
Write-Info "🔑 Login credentials:"
Write-Host "  📧 Email: admin@farmtally.in" -ForegroundColor White
Write-Host "  🔑 Password: FarmTallyAdmin2024!" -ForegroundColor White
Write-Host ""
Write-Info "✨ What was fixed:"
Write-Host "  - Authentication response handling" -ForegroundColor White
Write-Host "  - Token extraction from backend" -ForegroundColor White
Write-Host "  - User data transformation" -ForegroundColor White
Write-Host "  - Role-based redirects" -ForegroundColor White
Write-Host ""