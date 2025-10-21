# FarmTally Artifact Deployment System (PowerShell)
# Handles deployment and rollback of versioned artifacts

param(
    [Parameter(Position=0)]
    [ValidateSet("deploy", "rollback", "list-backups", "logs", "help")]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$ArtifactName = "",
    
    [Parameter(Position=2)]
    [string]$TargetHost = "localhost",
    
    [Parameter(Position=3)]
    [string]$DeployPath = "C:\farmtally",
    
    [Parameter(Position=4)]
    [string]$ServiceName = "farmtally",
    
    [Parameter(Position=5)]
    [string]$HealthUrl = "http://localhost:3000/api/health",
    
    [string]$BackupName = "",
    [string]$DateFilter = "",
    [string]$ArtifactsDir = "artifacts",
    [string]$DeploymentLogDir = "deployment-logs",
    [string]$BackupDir = "deployment-backups"
)

$ErrorActionPreference = "Stop"

# Logging functions
function Write-LogInfo {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[INFO] $timestamp $Message" -ForegroundColor Green
}

function Write-LogError {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[ERROR] $timestamp $Message" -ForegroundColor Red
}

function Write-LogWarn {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[WARN] $timestamp $Message" -ForegroundColor Yellow
}

# Create deployment log entry
function New-DeploymentLog {
    param(
        [string]$Action,
        [string]$ArtifactName,
        [string]$TargetHost,
        [string]$DeployPath,
        [string]$Status,
        [string]$Details
    )
    
    $timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    $logFile = Join-Path $DeploymentLogDir "deployment-$(Get-Date -Format 'yyyyMMdd').log"
    
    # Ensure log directory exists
    if (-not (Test-Path $DeploymentLogDir)) {
        New-Item -ItemType Directory -Path $DeploymentLogDir -Force | Out-Null
    }
    
    # Create log entry
    $logEntry = @{
        timestamp = $timestamp
        action = $Action
        artifact = $ArtifactName
        target = $TargetHost
        path = $DeployPath
        status = $Status
        details = $Details
        buildNumber = if ($env:BUILD_NUMBER) { $env:BUILD_NUMBER } else { "unknown" }
        buildUrl = if ($env:BUILD_URL) { $env:BUILD_URL } else { "unknown" }
        user = $env:USERNAME
        host = $env:COMPUTERNAME
    }
    
    $logEntry | ConvertTo-Json -Compress | Add-Content -Path $logFile
    Write-LogInfo "Deployment log entry created: $logFile"
}

# Verify artifact exists and is valid
function Test-ArtifactForDeployment {
    param([string]$ArtifactName)
    
    Write-LogInfo "Verifying artifact for deployment: $ArtifactName"
    
    $artifactPath = Join-Path $ArtifactsDir $ArtifactName
    
    if (-not (Test-Path $artifactPath)) {
        Write-LogError "Artifact directory not found: $artifactPath"
        return $false
    }
    
    # Check manifest exists
    $manifestPath = Join-Path $artifactPath "manifest.json"
    if (-not (Test-Path $manifestPath)) {
        Write-LogError "Artifact manifest not found: $manifestPath"
        return $false
    }
    
    # Verify artifact integrity using the artifact manager
    try {
        & ".\scripts\artifact-manager.ps1" verify -ArtifactName $ArtifactName
        Write-LogInfo "Artifact verification successful"
        return $true
    } catch {
        Write-LogError "Artifact integrity verification failed: $($_.Exception.Message)"
        return $false
    }
}

# Create backup of current deployment
function New-DeploymentBackup {
    param(
        [string]$TargetHost,
        [string]$DeployPath,
        [string]$BackupName
    )
    
    Write-LogInfo "Creating deployment backup: $BackupName"
    
    $backupPath = Join-Path $BackupDir $BackupName
    if (-not (Test-Path $backupPath)) {
        New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    }
    
    $backupFile = Join-Path $backupPath "current-deployment.zip"
    
    try {
        if ($TargetHost -eq "localhost" -or $TargetHost -eq "127.0.0.1" -or [string]::IsNullOrEmpty($TargetHost)) {
            # Local deployment backup
            if (Test-Path $DeployPath) {
                Write-LogInfo "Backing up local deployment from $DeployPath"
                Compress-Archive -Path "$DeployPath\*" -DestinationPath $backupFile -Force
            } else {
                Write-LogWarn "Deployment path does not exist, skipping backup: $DeployPath"
                return $true
            }
        } else {
            # Remote deployment backup (simplified - would need proper remote access setup)
            Write-LogWarn "Remote backup not fully implemented in PowerShell version"
            Write-LogWarn "Please ensure remote backup procedures are in place"
            return $true
        }
        
        # Create backup metadata
        $backupInfo = @{
            timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
            source = "$TargetHost`:$DeployPath"
            backupName = $BackupName
            creator = "$env:USERNAME@$env:COMPUTERNAME"
        }
        
        $backupInfoFile = Join-Path $backupPath "backup-info.json"
        $backupInfo | ConvertTo-Json | Out-File -FilePath $backupInfoFile -Encoding UTF8
        
        Write-LogInfo "Backup created successfully: $backupPath"
        return $true
    } catch {
        Write-LogWarn "Failed to create backup: $($_.Exception.Message)"
        return $false
    }
}

# Deploy backend component
function Deploy-Backend {
    param(
        [string]$ArtifactPath,
        [string]$TargetHost,
        [string]$DeployPath
    )
    
    Write-LogInfo "Deploying backend component"
    
    $backendPackage = Join-Path $ArtifactPath "backend\backend.zip"
    if (-not (Test-Path $backendPackage)) {
        # Try .tar.gz format
        $backendPackage = Join-Path $ArtifactPath "backend\backend.tar.gz"
        if (-not (Test-Path $backendPackage)) {
            throw "Backend package not found in artifact"
        }
    }
    
    if ($TargetHost -eq "localhost" -or $TargetHost -eq "127.0.0.1" -or [string]::IsNullOrEmpty($TargetHost)) {
        # Local deployment
        Write-LogInfo "Deploying backend locally to $DeployPath"
        
        # Create deployment directory
        if (-not (Test-Path $DeployPath)) {
            New-Item -ItemType Directory -Path $DeployPath -Force | Out-Null
        }
        
        # Extract backend package
        if ($backendPackage.EndsWith(".zip")) {
            Expand-Archive -Path $backendPackage -DestinationPath $DeployPath -Force
        } elseif ($backendPackage.EndsWith(".tar.gz")) {
            # Use tar if available, otherwise use 7-zip or similar
            if (Get-Command tar -ErrorAction SilentlyContinue) {
                tar -xzf $backendPackage -C $DeployPath
            } else {
                throw "Cannot extract .tar.gz file. Please install tar or convert to .zip format"
            }
        }
        
    } else {
        # Remote deployment (simplified - would need proper remote access setup)
        Write-LogWarn "Remote deployment not fully implemented in PowerShell version"
        throw "Remote deployment requires additional setup for PowerShell"
    }
    
    Write-LogInfo "Backend deployment completed"
}

# Deploy frontend component
function Deploy-Frontend {
    param(
        [string]$ArtifactPath,
        [string]$TargetHost,
        [string]$DeployPath
    )
    
    Write-LogInfo "Deploying frontend component"
    
    $frontendPackage = Join-Path $ArtifactPath "frontend\frontend.zip"
    if (-not (Test-Path $frontendPackage)) {
        # Try .tar.gz format
        $frontendPackage = Join-Path $ArtifactPath "frontend\frontend.tar.gz"
        if (-not (Test-Path $frontendPackage)) {
            throw "Frontend package not found in artifact"
        }
    }
    
    $frontendPath = Join-Path $DeployPath "frontend"
    
    if ($TargetHost -eq "localhost" -or $TargetHost -eq "127.0.0.1" -or [string]::IsNullOrEmpty($TargetHost)) {
        # Local deployment
        Write-LogInfo "Deploying frontend locally to $frontendPath"
        
        # Create frontend directory
        if (-not (Test-Path $frontendPath)) {
            New-Item -ItemType Directory -Path $frontendPath -Force | Out-Null
        }
        
        # Extract frontend package
        if ($frontendPackage.EndsWith(".zip")) {
            Expand-Archive -Path $frontendPackage -DestinationPath $frontendPath -Force
        } elseif ($frontendPackage.EndsWith(".tar.gz")) {
            if (Get-Command tar -ErrorAction SilentlyContinue) {
                tar -xzf $frontendPackage -C $frontendPath
            } else {
                throw "Cannot extract .tar.gz file. Please install tar or convert to .zip format"
            }
        }
        
    } else {
        # Remote deployment (simplified)
        Write-LogWarn "Remote deployment not fully implemented in PowerShell version"
        throw "Remote deployment requires additional setup for PowerShell"
    }
    
    Write-LogInfo "Frontend deployment completed"
}

# Setup deployment environment
function Initialize-DeploymentEnvironment {
    param(
        [string]$TargetHost,
        [string]$DeployPath
    )
    
    Write-LogInfo "Setting up deployment environment"
    
    if ($TargetHost -eq "localhost" -or $TargetHost -eq "127.0.0.1" -or [string]::IsNullOrEmpty($TargetHost)) {
        # Local setup
        Push-Location $DeployPath
        
        try {
            # Install production dependencies
            if (Test-Path "package.json") {
                Write-LogInfo "Installing production dependencies"
                npm ci --only=production
            }
            
            # Run database migrations if needed
            if (Test-Path "prisma\schema.prisma") {
                Write-LogInfo "Running database migrations"
                npx prisma migrate deploy
            }
        } finally {
            Pop-Location
        }
    } else {
        # Remote setup (would need implementation)
        Write-LogWarn "Remote environment setup not implemented in PowerShell version"
    }
    
    Write-LogInfo "Environment setup completed"
}

# Restart services
function Restart-DeploymentServices {
    param(
        [string]$TargetHost,
        [string]$DeployPath,
        [string]$ServiceName
    )
    
    Write-LogInfo "Restarting services"
    
    if ($TargetHost -eq "localhost" -or $TargetHost -eq "127.0.0.1" -or [string]::IsNullOrEmpty($TargetHost)) {
        # Local service restart
        try {
            # Try PM2 first
            if (Get-Command pm2 -ErrorAction SilentlyContinue) {
                Write-LogInfo "Restarting PM2 service: $ServiceName"
                pm2 restart $ServiceName
                if ($LASTEXITCODE -ne 0) {
                    $serverPath = Join-Path $DeployPath "dist\server.js"
                    pm2 start $serverPath --name $ServiceName
                }
            }
            # Try Windows Service
            elseif (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue) {
                Write-LogInfo "Restarting Windows service: $ServiceName"
                Restart-Service -Name $ServiceName
            }
            else {
                Write-LogWarn "No service manager found, manual restart required"
            }
        } catch {
            Write-LogWarn "Service restart failed: $($_.Exception.Message)"
        }
    } else {
        # Remote service restart (would need implementation)
        Write-LogWarn "Remote service restart not implemented in PowerShell version"
    }
    
    Write-LogInfo "Service restart completed"
}

# Verify deployment health
function Test-DeploymentHealth {
    param(
        [string]$TargetHost,
        [string]$HealthUrl,
        [int]$MaxAttempts = 30
    )
    
    Write-LogInfo "Verifying deployment health at $HealthUrl"
    
    # Wait for service to start
    Start-Sleep -Seconds 5
    
    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        Write-LogInfo "Health check attempt $attempt/$MaxAttempts"
        
        try {
            $response = Invoke-WebRequest -Uri $HealthUrl -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-LogInfo "Health check successful"
                return $true
            }
        } catch {
            # Continue trying
        }
        
        Start-Sleep -Seconds 2
    }
    
    Write-LogError "Health check failed after $MaxAttempts attempts"
    return $false
}

# Main deployment function
function Invoke-ArtifactDeployment {
    param(
        [string]$ArtifactName,
        [string]$TargetHost,
        [string]$DeployPath,
        [string]$ServiceName,
        [string]$HealthUrl
    )
    
    Write-LogInfo "Starting deployment of artifact: $ArtifactName"
    Write-LogInfo "Target: $TargetHost`:$DeployPath"
    
    $artifactPath = Join-Path $ArtifactsDir $ArtifactName
    $backupName = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')-$env:USERNAME"
    
    try {
        # Verify artifact
        if (-not (Test-ArtifactForDeployment -ArtifactName $ArtifactName)) {
            New-DeploymentLog -Action "deploy" -ArtifactName $ArtifactName -TargetHost $TargetHost -DeployPath $DeployPath -Status "failed" -Details "Artifact verification failed"
            throw "Artifact verification failed"
        }
        
        # Create backup
        if (-not (New-DeploymentBackup -TargetHost $TargetHost -DeployPath $DeployPath -BackupName $backupName)) {
            Write-LogWarn "Backup creation failed, continuing with deployment"
        }
        
        # Deploy components
        Deploy-Backend -ArtifactPath $artifactPath -TargetHost $TargetHost -DeployPath $DeployPath
        Deploy-Frontend -ArtifactPath $artifactPath -TargetHost $TargetHost -DeployPath $DeployPath
        
        # Setup environment
        Initialize-DeploymentEnvironment -TargetHost $TargetHost -DeployPath $DeployPath
        
        # Restart services
        Restart-DeploymentServices -TargetHost $TargetHost -DeployPath $DeployPath -ServiceName $ServiceName
        
        # Verify health
        if (-not (Test-DeploymentHealth -TargetHost $TargetHost -HealthUrl $HealthUrl)) {
            New-DeploymentLog -Action "deploy" -ArtifactName $ArtifactName -TargetHost $TargetHost -DeployPath $DeployPath -Status "failed" -Details "Health check failed"
            Write-LogError "Deployment health check failed, consider rollback"
            throw "Health check failed"
        }
        
        New-DeploymentLog -Action "deploy" -ArtifactName $ArtifactName -TargetHost $TargetHost -DeployPath $DeployPath -Status "success" -Details "Deployment completed successfully"
        Write-LogInfo "Deployment completed successfully: $ArtifactName"
        return $true
        
    } catch {
        New-DeploymentLog -Action "deploy" -ArtifactName $ArtifactName -TargetHost $TargetHost -DeployPath $DeployPath -Status "failed" -Details $_.Exception.Message
        Write-LogError "Deployment failed: $($_.Exception.Message)"
        throw
    }
}

# Rollback deployment
function Invoke-DeploymentRollback {
    param(
        [string]$TargetHost,
        [string]$DeployPath,
        [string]$BackupName,
        [string]$ServiceName,
        [string]$HealthUrl
    )
    
    Write-LogInfo "Starting rollback deployment"
    Write-LogInfo "Target: $TargetHost`:$DeployPath"
    
    if ([string]::IsNullOrEmpty($BackupName)) {
        # Find the most recent backup
        $backups = Get-ChildItem -Path $BackupDir -Directory -Name "backup-*" | Sort-Object -Descending
        if ($backups.Count -eq 0) {
            Write-LogError "No backup found for rollback"
            throw "No backup available"
        }
        $BackupName = $backups[0]
        Write-LogInfo "Using most recent backup: $BackupName"
    }
    
    $backupPath = Join-Path $BackupDir $BackupName
    $backupFile = Join-Path $backupPath "current-deployment.zip"
    
    if (-not (Test-Path $backupFile)) {
        Write-LogError "Backup file not found: $backupFile"
        throw "Backup file not found"
    }
    
    Write-LogInfo "Rolling back from backup: $BackupName"
    
    try {
        if ($TargetHost -eq "localhost" -or $TargetHost -eq "127.0.0.1" -or [string]::IsNullOrEmpty($TargetHost)) {
            # Local rollback
            Write-LogInfo "Performing local rollback"
            
            # Remove current deployment
            if (Test-Path $DeployPath) {
                Remove-Item -Path $DeployPath -Recurse -Force
            }
            
            # Create parent directory
            $parentPath = Split-Path $DeployPath -Parent
            if (-not (Test-Path $parentPath)) {
                New-Item -ItemType Directory -Path $parentPath -Force | Out-Null
            }
            
            # Restore from backup
            Expand-Archive -Path $backupFile -DestinationPath $DeployPath -Force
            
        } else {
            # Remote rollback (would need implementation)
            Write-LogWarn "Remote rollback not implemented in PowerShell version"
            throw "Remote rollback requires additional setup"
        }
        
        # Restart services
        Restart-DeploymentServices -TargetHost $TargetHost -DeployPath $DeployPath -ServiceName $ServiceName
        
        # Verify health
        if (-not (Test-DeploymentHealth -TargetHost $TargetHost -HealthUrl $HealthUrl)) {
            New-DeploymentLog -Action "rollback" -ArtifactName $BackupName -TargetHost $TargetHost -DeployPath $DeployPath -Status "failed" -Details "Health check failed after rollback"
            Write-LogError "Rollback health check failed"
            throw "Health check failed after rollback"
        }
        
        New-DeploymentLog -Action "rollback" -ArtifactName $BackupName -TargetHost $TargetHost -DeployPath $DeployPath -Status "success" -Details "Rollback completed successfully"
        Write-LogInfo "Rollback completed successfully"
        return $true
        
    } catch {
        New-DeploymentLog -Action "rollback" -ArtifactName $BackupName -TargetHost $TargetHost -DeployPath $DeployPath -Status "failed" -Details $_.Exception.Message
        Write-LogError "Rollback failed: $($_.Exception.Message)"
        throw
    }
}

# List available backups
function Get-BackupList {
    Write-Host "Available deployment backups:"
    Write-Host "============================="
    
    if (-not (Test-Path $BackupDir)) {
        Write-Host "No backup directory found"
        return
    }
    
    $backups = Get-ChildItem -Path $BackupDir -Directory -Name "backup-*"
    
    if ($backups.Count -eq 0) {
        Write-Host "No backups found"
        return
    }
    
    foreach ($backup in $backups) {
        $infoFile = Join-Path $BackupDir $backup "backup-info.json"
        
        if (Test-Path $infoFile) {
            try {
                $info = Get-Content $infoFile | ConvertFrom-Json
                $timestamp = $info.timestamp
                $source = $info.source
                Write-Host "  $backup (created: $timestamp, source: $source)"
            } catch {
                Write-Host "  $backup (invalid info)"
            }
        } else {
            Write-Host "  $backup (no info available)"
        }
    }
    
    Write-Host ""
    Write-Host "Total: $($backups.Count) backups"
}

# Show deployment logs
function Show-DeploymentLogs {
    param([string]$DateFilter)
    
    Write-Host "Deployment logs:"
    Write-Host "==============="
    
    if (-not (Test-Path $DeploymentLogDir)) {
        Write-Host "No deployment logs found"
        return
    }
    
    if (-not [string]::IsNullOrEmpty($DateFilter)) {
        $logFile = Join-Path $DeploymentLogDir "deployment-$DateFilter.log"
        if (Test-Path $logFile) {
            Get-Content $logFile
        } else {
            Write-Host "No logs found for date: $DateFilter"
        }
    } else {
        # Show recent logs
        $logFiles = Get-ChildItem -Path $DeploymentLogDir -Name "deployment-*.log" | Sort-Object -Descending
        if ($logFiles.Count -gt 0) {
            $recentFile = Join-Path $DeploymentLogDir $logFiles[0]
            Get-Content $recentFile | Select-Object -Last 20
        } else {
            Write-Host "No log files found"
        }
    }
}

# Show help
function Show-Help {
    Write-Host "FarmTally Artifact Deployer (PowerShell)"
    Write-Host ""
    Write-Host "Usage: .\artifact-deployer.ps1 [command] [options]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  deploy -ArtifactName <name> [-TargetHost <host>] [-DeployPath <path>] [-ServiceName <name>] [-HealthUrl <url>]"
    Write-Host "    Deploy an artifact to target environment"
    Write-Host ""
    Write-Host "  rollback [-TargetHost <host>] [-DeployPath <path>] [-BackupName <name>] [-ServiceName <name>] [-HealthUrl <url>]"
    Write-Host "    Rollback to previous deployment"
    Write-Host ""
    Write-Host "  list-backups"
    Write-Host "    List available deployment backups"
    Write-Host ""
    Write-Host "  logs [-DateFilter <YYYYMMDD>]"
    Write-Host "    Show deployment logs"
    Write-Host ""
    Write-Host "  help"
    Write-Host "    Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\artifact-deployer.ps1 deploy -ArtifactName farmtally-v123-abc12345"
    Write-Host "  .\artifact-deployer.ps1 rollback"
    Write-Host "  .\artifact-deployer.ps1 list-backups"
    Write-Host "  .\artifact-deployer.ps1 logs -DateFilter 20240115"
}

# Main execution
try {
    switch ($Command) {
        "deploy" {
            if ([string]::IsNullOrEmpty($ArtifactName)) {
                throw "Usage: .\artifact-deployer.ps1 deploy -ArtifactName <artifact-name>"
            }
            Invoke-ArtifactDeployment -ArtifactName $ArtifactName -TargetHost $TargetHost -DeployPath $DeployPath -ServiceName $ServiceName -HealthUrl $HealthUrl
        }
        
        "rollback" {
            Invoke-DeploymentRollback -TargetHost $TargetHost -DeployPath $DeployPath -BackupName $BackupName -ServiceName $ServiceName -HealthUrl $HealthUrl
        }
        
        "list-backups" {
            Get-BackupList
        }
        
        "logs" {
            Show-DeploymentLogs -DateFilter $DateFilter
        }
        
        "help" {
            Show-Help
        }
        
        default {
            throw "Unknown command: $Command"
        }
    }
} catch {
    Write-LogError $_.Exception.Message
    exit 1
}