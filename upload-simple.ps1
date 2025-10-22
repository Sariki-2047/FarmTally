# Simple FarmTally Frontend Upload Script
param(
    [string]$VpsIP = "147.93.153.247",
    [string]$VpsUser = "root"
)

Write-Host "🚀 UPLOADING FARMTALLY FRONTEND TO VPS" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if required files exist
$frontendPath = "farmtally-frontend\out"
$nginxConfig = "nginx-farmtally.conf"
$deployScript = "deploy-to-vps.sh"

Write-Host "📋 Checking required files..." -ForegroundColor Yellow

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Frontend build not found at: $frontendPath" -ForegroundColor Red
    Write-Host "Please run 'npm run build' in the farmtally-frontend directory first." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $nginxConfig)) {
    Write-Host "❌ Nginx config not found: $nginxConfig" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $deployScript)) {
    Write-Host "❌ Deploy script not found: $deployScript" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All required files found" -ForegroundColor Green

# Check if SCP is available
Write-Host "📋 Checking SCP availability..." -ForegroundColor Yellow
$scpCommand = Get-Command scp -ErrorAction SilentlyContinue
if (-not $scpCommand) {
    Write-Host "❌ SCP not found. Please install OpenSSH or use manual upload." -ForegroundColor Red
    Write-Host "" -ForegroundColor White
    Write-Host "Manual upload instructions:" -ForegroundColor Yellow
    Write-Host "1. Use WinSCP to connect to $VpsIP as $VpsUser" -ForegroundColor White
    Write-Host "2. Upload 'farmtally-frontend\out' folder as 'farmtally-frontend-build'" -ForegroundColor White
    Write-Host "3. Upload 'nginx-farmtally.conf' and 'deploy-to-vps.sh'" -ForegroundColor White
    Write-Host "4. SSH to VPS and run: chmod +x deploy-to-vps.sh && ./deploy-to-vps.sh" -ForegroundColor White
    exit 1
}

Write-Host "✅ SCP is available" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "📤 Starting upload to $VpsIP..." -ForegroundColor Cyan

# Upload frontend files
Write-Host "📁 Uploading frontend files..." -ForegroundColor Yellow
$scpResult1 = & scp -r $frontendPath "${VpsUser}@${VpsIP}:/root/farmtally-frontend-build" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend files uploaded successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend upload failed: $scpResult1" -ForegroundColor Red
    exit 1
}

# Upload configuration files
Write-Host "📄 Uploading configuration files..." -ForegroundColor Yellow
$scpResult2 = & scp $nginxConfig "${VpsUser}@${VpsIP}:/root/" 2>&1
$scpResult3 = & scp $deployScript "${VpsUser}@${VpsIP}:/root/" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Configuration files uploaded successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Configuration upload failed" -ForegroundColor Red
    exit 1
}

Write-Host "" -ForegroundColor White
Write-Host "🎉 UPLOAD COMPLETE!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. SSH to your VPS:" -ForegroundColor White
Write-Host "   ssh $VpsUser@$VpsIP" -ForegroundColor Gray
Write-Host "" -ForegroundColor White
Write-Host "2. Run the deployment script:" -ForegroundColor White
Write-Host "   chmod +x deploy-to-vps.sh" -ForegroundColor Gray
Write-Host "   ./deploy-to-vps.sh" -ForegroundColor Gray
Write-Host "" -ForegroundColor White
Write-Host "3. Test your application:" -ForegroundColor White
Write-Host "   http://$VpsIP" -ForegroundColor Gray
Write-Host "   http://$VpsIP/test-api" -ForegroundColor Gray