# FarmTally Microservices Deployment Script for Windows
# Deploy individual services to VPS with Docker Compose

param(
    [string]$Service = "all",
    [string]$VpsHost = "147.93.153.247",
    [string]$VpsUser = "root"
)

$ProjectDir = "/opt/farmtally"
$BackupDir = "/opt/farmtally-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "🚀 Starting FarmTally Microservices Deployment..." -ForegroundColor Blue

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-VpsConnection {
    Write-Status "Testing VPS connection..."
    
    try {
        $result = ssh $VpsUser@$VpsHost "echo 'Connection successful'"
        if ($LASTEXITCODE -eq 0) {
            Write-Success "VPS connection successful"
            return $true
        } else {
            Write-Error "Cannot connect to VPS at $VpsHost"
            return $false
        }
    } catch {
        Write-Error "SSH connection failed: $_"
        return $false
    }
}

function Deploy-Files {
    Write-Status "Uploading microservices files to VPS..."
    
    # Create project directory
    ssh $VpsUser@$VpsHost "mkdir -p $ProjectDir"
    
    # Upload Docker Compose file
    scp docker-compose.microservices.yml ${VpsUser}@${VpsHost}:${ProjectDir}/
    
    # Upload services directory
    scp -r services/ ${VpsUser}@${VpsHost}:${ProjectDir}/
    
    Write-Success "Files uploaded successfully"
}

function Setup-Database {
    Write-Status "Setting up PostgreSQL database..."
    
    ssh $VpsUser@$VpsHost "cd $ProjectDir && docker-compose -f docker-compose.microservices.yml up -d postgres"
    
    Write-Status "Waiting for database to be ready..."
    Start-Sleep -Seconds 30
    
    $dbCheck = ssh $VpsUser@$VpsHost "docker exec farmtally-postgres pg_isready -U farmtally_user"
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Database is ready"
        return $true
    } else {
        Write-Error "Database setup failed"
        return $false
    }
}

function Deploy-Service {
    param(
        [string]$ServiceName,
        [int]$Port
    )
    
    Write-Status "Deploying $ServiceName on port $Port..."
    
    ssh $VpsUser@$VpsHost "cd $ProjectDir && docker-compose -f docker-compose.microservices.yml up -d --build $ServiceName"
    
    Start-Sleep -Seconds 10
    
    # Health check
    $healthCheck = ssh $VpsUser@$VpsHost "curl -f http://localhost:$Port/health"
    if ($LASTEXITCODE -eq 0) {
        Write-Success "$ServiceName is running and healthy on port $Port"
        return $true
    } else {
        Write-Error "$ServiceName health check failed on port $Port"
        return $false
    }
}

function Deploy-AllServices {
    Write-Status "Deploying all microservices..."
    
    $services = @(
        @{Name="auth-service"; Port=8081},
        @{Name="organization-service"; Port=8082},
        @{Name="farmer-service"; Port=8083},
        @{Name="lorry-service"; Port=8084},
        @{Name="delivery-service"; Port=8085},
        @{Name="payment-service"; Port=8086},
        @{Name="notification-service"; Port=8087},
        @{Name="field-manager-service"; Port=8088},
        @{Name="farm-admin-service"; Port=8089},
        @{Name="report-service"; Port=8090},
        @{Name="api-gateway"; Port=8080}
    )
    
    foreach ($svc in $services) {
        $result = Deploy-Service -ServiceName $svc.Name -Port $svc.Port
        if (-not $result) {
            Write-Error "Failed to deploy $($svc.Name)"
        }
    }
    
    Write-Success "All services deployment completed"
}

function Run-HealthChecks {
    Write-Status "Running comprehensive health checks..."
    
    $services = @(
        @{Name="postgres"; Port=5432; Type="db"},
        @{Name="auth-service"; Port=8081; Type="service"},
        @{Name="organization-service"; Port=8082; Type="service"},
        @{Name="farmer-service"; Port=8083; Type="service"},
        @{Name="lorry-service"; Port=8084; Type="service"},
        @{Name="delivery-service"; Port=8085; Type="service"},
        @{Name="payment-service"; Port=8086; Type="service"},
        @{Name="notification-service"; Port=8087; Type="service"},
        @{Name="field-manager-service"; Port=8088; Type="service"},
        @{Name="farm-admin-service"; Port=8089; Type="service"},
        @{Name="report-service"; Port=8090; Type="service"},
        @{Name="api-gateway"; Port=8080; Type="service"}
    )
    
    foreach ($svc in $services) {
        if ($svc.Type -eq "db") {
            $check = ssh $VpsUser@$VpsHost "docker exec farmtally-postgres pg_isready -U farmtally_user"
        } else {
            $check = ssh $VpsUser@$VpsHost "curl -f http://localhost:$($svc.Port)/health"
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "$($svc.Name) is healthy"
        } else {
            Write-Error "$($svc.Name) health check failed"
        }
    }
}

function Show-ServiceStatus {
    Write-Status "Service Status Summary:"
    
    ssh $VpsUser@$VpsHost "cd $ProjectDir && docker-compose -f docker-compose.microservices.yml ps"
    
    Write-Host ""
    Write-Status "Service URLs:"
    Write-Host "🌐 Frontend: http://147.93.153.247" -ForegroundColor Green
    Write-Host "🚪 API Gateway: http://147.93.153.247:8080" -ForegroundColor Green
    Write-Host "🔐 Auth Service: http://147.93.153.247:8081" -ForegroundColor Green
    Write-Host "🏢 Organization Service: http://147.93.153.247:8082" -ForegroundColor Green
    Write-Host "👨‍🌾 Farmer Service: http://147.93.153.247:8083" -ForegroundColor Green
    Write-Host "🚛 Lorry Service: http://147.93.153.247:8084" -ForegroundColor Green
    Write-Host "📦 Delivery Service: http://147.93.153.247:8085" -ForegroundColor Green
    Write-Host "💰 Payment Service: http://147.93.153.247:8086" -ForegroundColor Green
    Write-Host "📧 Notification Service: http://147.93.153.247:8087" -ForegroundColor Green
    Write-Host "👨‍🌾 Field Manager Service: http://147.93.153.247:8088" -ForegroundColor Green
    Write-Host "🏢 Farm Admin Service: http://147.93.153.247:8089" -ForegroundColor Green
    Write-Host "📊 Report Service: http://147.93.153.247:8090" -ForegroundColor Green
}

# Main deployment logic
if (-not (Test-VpsConnection)) {
    exit 1
}

switch ($Service) {
    "auth" { Deploy-Service -ServiceName "auth-service" -Port 8081 }
    "organization" { Deploy-Service -ServiceName "organization-service" -Port 8082 }
    "farmer" { Deploy-Service -ServiceName "farmer-service" -Port 8083 }
    "lorry" { Deploy-Service -ServiceName "lorry-service" -Port 8084 }
    "delivery" { Deploy-Service -ServiceName "delivery-service" -Port 8085 }
    "payment" { Deploy-Service -ServiceName "payment-service" -Port 8086 }
    "notification" { Deploy-Service -ServiceName "notification-service" -Port 8087 }
    "field-manager" { Deploy-Service -ServiceName "field-manager-service" -Port 8088 }
    "farm-admin" { Deploy-Service -ServiceName "farm-admin-service" -Port 8089 }
    "report" { Deploy-Service -ServiceName "report-service" -Port 8090 }
    "gateway" { Deploy-Service -ServiceName "api-gateway" -Port 8080 }
    "health" { Run-HealthChecks }
    "status" { Show-ServiceStatus }
    default {
        # Deploy all services
        Deploy-Files
        Setup-Database
        Deploy-AllServices
        Run-HealthChecks
        Show-ServiceStatus
        Write-Success "🎉 FarmTally microservices deployment completed successfully!"
        Write-Status "You can now access the application at: http://147.93.153.247"
    }
}