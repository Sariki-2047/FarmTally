# FarmTally Connectivity Test Script
# Tests all FarmTally services on the VPS

param(
    [string]$VpsHost = "147.93.153.247"
)

Write-Host "🔍 Testing FarmTally Connectivity on $VpsHost" -ForegroundColor Green
Write-Host "=" * 60

# Test 1: Ping the VPS server
Write-Host "`n1. 🌐 Testing VPS Server Connectivity..." -ForegroundColor Cyan
try {
    $pingResult = Test-Connection -ComputerName $VpsHost -Count 4 -ErrorAction Stop
    Write-Host "✅ VPS Server is reachable" -ForegroundColor Green
    Write-Host "   Average Response Time: $($pingResult | Measure-Object ResponseTime -Average | Select-Object -ExpandProperty Average)ms" -ForegroundColor White
} catch {
    Write-Host "❌ VPS Server is not reachable: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Test Frontend (Port 8081)
Write-Host "`n2. 🌐 Testing Frontend (Port 8081)..." -ForegroundColor Cyan
try {
    $frontendUrl = "http://${VpsHost}:8081"
    $response = Invoke-WebRequest -Uri $frontendUrl -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Frontend is accessible" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor White
    Write-Host "   Content Length: $($response.Content.Length) bytes" -ForegroundColor White
    Write-Host "   Server: $($response.Headers.Server)" -ForegroundColor White
    
    # Check if it's the default Nginx page or FarmTally
    if ($response.Content -like "*Welcome to nginx*") {
        Write-Host "   Content: Default Nginx welcome page" -ForegroundColor Yellow
    } elseif ($response.Content -like "*FarmTally*") {
        Write-Host "   Content: FarmTally application detected" -ForegroundColor Green
    } else {
        Write-Host "   Content: Custom content (not default Nginx)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Frontend is not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test Backend (Port 8082)
Write-Host "`n3. 🔧 Testing Backend API (Port 8082)..." -ForegroundColor Cyan
try {
    $backendUrl = "http://${VpsHost}:8082"
    $response = Invoke-WebRequest -Uri $backendUrl -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Backend is accessible" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor White
    Write-Host "   Content Length: $($response.Content.Length) bytes" -ForegroundColor White
} catch {
    Write-Host "❌ Backend is not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test Backend Health Endpoint
Write-Host "`n4. 🏥 Testing Backend Health Endpoint..." -ForegroundColor Cyan
try {
    $healthUrl = "http://${VpsHost}:8082/health"
    $response = Invoke-WebRequest -Uri $healthUrl -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Health endpoint is accessible" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor White
    Write-Host "   Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "❌ Health endpoint is not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Test Database Port (8083)
Write-Host "`n5. 🗄️ Testing Database Port (8083)..." -ForegroundColor Cyan
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.Connect($VpsHost, 8083)
    if ($tcpClient.Connected) {
        Write-Host "✅ Database port is open and accessible" -ForegroundColor Green
        $tcpClient.Close()
    }
} catch {
    Write-Host "❌ Database port is not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Test Jenkins (Port 8080)
Write-Host "`n6. 🔧 Testing Jenkins (Port 8080)..." -ForegroundColor Cyan
try {
    $jenkinsUrl = "http://${VpsHost}:8080"
    $response = Invoke-WebRequest -Uri $jenkinsUrl -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Jenkins is accessible" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "❌ Jenkins is not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Test Portainer (Port 9000)
Write-Host "`n7. 🐳 Testing Portainer (Port 9000)..." -ForegroundColor Cyan
try {
    $portainerUrl = "http://${VpsHost}:9000"
    $response = Invoke-WebRequest -Uri $portainerUrl -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Portainer is accessible" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "❌ Portainer is not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n" + "=" * 60
Write-Host "📊 CONNECTIVITY TEST SUMMARY" -ForegroundColor Yellow
Write-Host "=" * 60

Write-Host "`n🌐 Service URLs:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://${VpsHost}:8081" -ForegroundColor White
Write-Host "   Backend:   http://${VpsHost}:8082" -ForegroundColor White
Write-Host "   Health:    http://${VpsHost}:8082/health" -ForegroundColor White
Write-Host "   Jenkins:   http://${VpsHost}:8080" -ForegroundColor White
Write-Host "   Portainer: http://${VpsHost}:9000" -ForegroundColor White

Write-Host "`n🔍 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. If Frontend shows Nginx page, Jenkins deployment is working" -ForegroundColor White
Write-Host "   2. If Backend fails, check container logs in Jenkins" -ForegroundColor White
Write-Host "   3. Use Jenkins to rebuild if needed" -ForegroundColor White

Write-Host "`nTest completed at $(Get-Date)" -ForegroundColor Gray