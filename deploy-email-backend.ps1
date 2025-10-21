# PowerShell script to deploy email backend to VPS

Write-Host "🚀 Deploying FarmTally Email Backend" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

$VPS_HOST = "147.93.153.247"
$VPS_USER = "root"
$VPS_PATH = "/var/www/farmtally/backend"

# Function to run SSH commands
function Invoke-SSHCommand {
    param($Command)
    Write-Host "🔄 Executing: $Command" -ForegroundColor Yellow
    ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" $Command
}

# Function to upload files
function Copy-FileToVPS {
    param($LocalFile, $RemotePath)
    Write-Host "📤 Uploading: $LocalFile" -ForegroundColor Yellow
    scp -o StrictHostKeyChecking=no $LocalFile "$VPS_USER@${VPS_HOST}:$RemotePath"
}

try {
    # 1. Create backend directory
    Write-Host "📁 Creating backend directory..." -ForegroundColor Cyan
    Invoke-SSHCommand "mkdir -p $VPS_PATH"
    Write-Host "✅ Backend directory created" -ForegroundColor Green

    # 2. Upload files
    Write-Host "📤 Uploading backend files..." -ForegroundColor Cyan
    Copy-FileToVPS "simple-supabase-backend.cjs" "$VPS_PATH/"
    Copy-FileToVPS "package.json" "$VPS_PATH/"
    Write-Host "✅ Files uploaded successfully" -ForegroundColor Green

    # 3. Install dependencies
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    Invoke-SSHCommand "cd $VPS_PATH && npm install"
    Write-Host "✅ Dependencies installed" -ForegroundColor Green

    # 4. Stop existing backend
    Write-Host "🛑 Stopping existing backend..." -ForegroundColor Cyan
    Invoke-SSHCommand "pkill -f 'node.*simple-supabase-backend' || true"
    Write-Host "✅ Existing backend stopped" -ForegroundColor Green

    # 5. Start new backend
    Write-Host "🚀 Starting email-enabled backend..." -ForegroundColor Cyan
    Invoke-SSHCommand "cd $VPS_PATH && nohup node simple-supabase-backend.cjs > backend.log 2>&1 &"
    Write-Host "✅ Backend started" -ForegroundColor Green

    # 6. Wait and test
    Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Cyan
    Start-Sleep -Seconds 8

    Write-Host "🧪 Testing backend endpoints..." -ForegroundColor Cyan
    
    # Test health endpoint
    try {
        $healthResponse = Invoke-RestMethod -Uri "http://$VPS_HOST:3001/health" -TimeoutSec 10
        Write-Host "✅ Health check passed: $($healthResponse.status)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Test email status endpoint
    try {
        $emailResponse = Invoke-RestMethod -Uri "http://$VPS_HOST:3001/api/email/status" -TimeoutSec 10
        Write-Host "✅ Email API working: Enabled=$($emailResponse.config.enabled)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Email API check failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "🎉 Email Backend Deployment Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Backend Details:" -ForegroundColor Cyan
    Write-Host "  🌐 Backend URL: http://$VPS_HOST:3001"
    Write-Host "  📊 Health Check: http://$VPS_HOST:3001/health"
    Write-Host "  📧 Email Status: http://$VPS_HOST:3001/api/email/status"
    Write-Host "  🧪 Test Email: http://$VPS_HOST:3001/api/email/test"
    Write-Host ""
    Write-Host "📧 Email Features Active:" -ForegroundColor Cyan
    Write-Host "  ✅ User registration → Admin notifications"
    Write-Host "  ✅ User approval → Welcome emails"
    Write-Host "  ✅ Hostinger SMTP integration"
    Write-Host "  ✅ Professional email templates"
    Write-Host ""
    Write-Host "🔧 To check backend logs:" -ForegroundColor Cyan
    Write-Host "  ssh $VPS_USER@$VPS_HOST 'cd $VPS_PATH && tail -f backend.log'"

} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}