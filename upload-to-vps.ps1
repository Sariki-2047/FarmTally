# FarmTally Frontend Upload Script for Windows
# This script uploads the built frontend and configuration files to your VPS

$VPS_IP = "147.93.153.247"
$VPS_USER = "root"

Write-Host "🚀 UPLOADING FARMTALLY FRONTEND TO VPS" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if required files exist
$frontendPath = "farmtally-frontend\out"
$nginxConfig = "nginx-farmtally.conf"
$deployScript = "deploy-to-vps.sh"

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
# Check if SCP is available
$scpAvailable = $false
try {
    $null = Get-Command scp -ErrorAction Stop
    $scpAvailable = $true
    Write-Host "✅ SCP is available" -ForegroundColor Green
} catch {
    Write-Host "❌ SCP not found. Please install OpenSSH or use WinSCP manually." -ForegroundColor Red
    Write-Host "" -ForegroundColor White
    Write-Host "Manual upload instructions:" -ForegroundColor Yellow
    Write-Host "1. Use WinSCP to connect to $VPS_IP as $VPS_USER" -ForegroundColor White
    Write-Host "2. Upload 'farmtally-frontend\out' folder as 'farmtally-frontend-build'" -ForegroundColor White
    Write-Host "3. Upload 'nginx-farmtally.conf' and 'deploy-to-vps.sh'" -ForegroundColor White
    Write-Host "4. SSH to VPS and run: chmod +x deploy-to-vps.sh && ./deploy-to-vps.sh" -ForegroundColor White
    exit 1
}

if (-not $scpAvailable) {
    exit 1
}

Write-Host "" -ForegroundColor White
Write-Host "📤 Starting upload to $VPS_IP..." -ForegroundColor Cyan

try {
    # Upload frontend files
    Write-Host "📁 Uploading frontend files..." -ForegroundColor Yellow
    scp -r $frontendPath "${VPS_USER}@${VPS_IP}:/root/farmtally-frontend-build"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend files uploaded successfully" -ForegroundColor Green
    } else {
        throw "Frontend upload failed"
    }
    
    # Upload configuration files
    Write-Host "📄 Uploading configuration files..." -ForegroundColor Yellow
    scp $nginxConfig "${VPS_USER}@${VPS_IP}:/root/"
    scp $deployScript "${VPS_USER}@${VPS_IP}:/root/"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Configuration files uploaded successfully" -ForegroundColor Green
    } else {
        throw "Configuration upload failed"
    }
    
    Write-Host "" -ForegroundColor White
    Write-Host "🎉 UPLOAD COMPLETE!" -ForegroundColor Green
    Write-Host "==================" -ForegroundColor Green
    Write-Host "" -ForegroundColor White
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. SSH to your VPS:" -ForegroundColor White
    Write-Host "   ssh $VPS_USER@$VPS_IP" -ForegroundColor Gray
    Write-Host "" -ForegroundColor White
    Write-Host "2. Run the deployment script:" -ForegroundColor White
    Write-Host "   chmod +x deploy-to-vps.sh" -ForegroundColor Gray
    Write-Host "   ./deploy-to-vps.sh" -ForegroundColor Gray
    Write-Host "" -ForegroundColor White
    Write-Host "3. Test your application:" -ForegroundColor White
    Write-Host "   http://$VPS_IP" -ForegroundColor Gray
    Write-Host "   http://$VPS_IP/test-api" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Upload failed: $_" -ForegroundColor Red
    Write-Host "" -ForegroundColor White
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "- VPS is accessible" -ForegroundColor White
    Write-Host "- SSH key is configured" -ForegroundColor White
    Write-Host "- Network connection is stable" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    Write-Host "Alternative: Use WinSCP for manual upload" -ForegroundColor Cyan
    exit 1
}