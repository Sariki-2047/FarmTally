# FarmTally Artifact Management System (PowerShell)
# Handles versioning, packaging, and storage of build artifacts

param(
    [Parameter(Position=0)]
    [ValidateSet("create", "list", "verify", "clean", "help")]
    [string]$Command = "create",
    
    [Parameter(Position=1)]
    [string]$ArtifactName = "",
    
    [int]$RetentionDays = 30,
    [int]$MaxArtifacts = 50,
    [string]$ArtifactsDir = "artifacts"
)

# Configuration
$ErrorActionPreference = "Stop"

# Version information class
class VersionInfo {
    [string]$CommitSha
    [string]$CommitShort
    [string]$BuildNumber
    [string]$BuildTimestamp
    [string]$BranchName
    [string]$ArtifactVersion
    [string]$ArtifactName
}

# Component information class
class ComponentInfo {
    [string]$Name
    [string]$Type
    [string]$Path
    [long]$Size
    [string]$Checksum
}

function Get-VersionInfo {
    $version = [VersionInfo]::new()
    
    try {
        $version.CommitSha = git rev-parse HEAD 2>$null
        if (-not $version.CommitSha) { $version.CommitSha = "unknown" }
    } catch {
        $version.CommitSha = "unknown"
    }
    
    $version.CommitShort = $version.CommitSha.Substring(0, [Math]::Min(8, $version.CommitSha.Length))
    
    if ($env:BUILD_NUMBER) {
        $version.BuildNumber = $env:BUILD_NUMBER
    } else {
        $version.BuildNumber = [int][double]::Parse((Get-Date -UFormat %s))
    }
    
    $version.BuildTimestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    
    try {
        $version.BranchName = git rev-parse --abbrev-ref HEAD 2>$null
        if (-not $version.BranchName) { $version.BranchName = "unknown" }
    } catch {
        $version.BranchName = "unknown"
    }
    
    $version.ArtifactVersion = "v$($version.BuildNumber)-$($version.CommitShort)"
    $version.ArtifactName = "farmtally-$($version.ArtifactVersion)"
    
    Write-Host "Version Info:"
    Write-Host "  Commit SHA: $($version.CommitSha)"
    Write-Host "  Build Number: $($version.BuildNumber)"
    Write-Host "  Artifact Version: $($version.ArtifactVersion)"
    Write-Host "  Branch: $($version.BranchName)"
    Write-Host "  Timestamp: $($version.BuildTimestamp)"
    
    return $version
}

function New-ArtifactDirectory {
    param([VersionInfo]$Version)
    
    $artifactPath = Join-Path $ArtifactsDir $Version.ArtifactName
    
    Write-Host "Setting up artifact directory: $artifactPath"
    
    if (-not (Test-Path $artifactPath)) {
        New-Item -ItemType Directory -Path $artifactPath -Force | Out-Null
    }
    
    # Create subdirectories
    @("backend", "frontend", "metadata") | ForEach-Object {
        $subDir = Join-Path $artifactPath $_
        if (-not (Test-Path $subDir)) {
            New-Item -ItemType Directory -Path $subDir -Force | Out-Null
        }
    }
    
    return $artifactPath
}

function New-BackendPackage {
    param([string]$ArtifactPath)
    
    Write-Host "Packaging backend artifacts..."
    
    # Verify backend build exists
    if (-not (Test-Path "dist")) {
        throw "ERROR: Backend build directory 'dist' not found. Please run 'npm run build' first"
    }
    
    $backendPackage = Join-Path $ArtifactPath "backend\backend.zip"
    
    # Create backend package
    $filesToCompress = @("dist", "package.json", "package-lock.json", "prisma")
    $existingFiles = $filesToCompress | Where-Object { Test-Path $_ }
    
    if ($existingFiles.Count -eq 0) {
        throw "ERROR: No backend files found to package"
    }
    
    try {
        Compress-Archive -Path $existingFiles -DestinationPath $backendPackage -Force
    } catch {
        throw "ERROR: Failed to create backend package: $($_.Exception.Message)"
    }
    
    # Calculate checksum
    $checksum = (Get-FileHash $backendPackage -Algorithm SHA256).Hash
    $checksumFile = Join-Path $ArtifactPath "backend\backend.sha256"
    $checksum | Out-File -FilePath $checksumFile -Encoding ASCII
    
    # Get package size
    $size = (Get-Item $backendPackage).Length
    
    Write-Host "Backend package created:"
    Write-Host "  File: $backendPackage"
    Write-Host "  Size: $size bytes"
    Write-Host "  Checksum: $checksum"
    
    return [ComponentInfo]@{
        Name = "backend"
        Type = "backend"
        Path = "backend/backend.zip"
        Size = $size
        Checksum = $checksum
    }
}

function New-FrontendPackage {
    param([string]$ArtifactPath)
    
    Write-Host "Packaging frontend artifacts..."
    
    # Verify frontend build exists
    if (-not (Test-Path "farmtally-frontend\.next")) {
        throw "ERROR: Frontend build directory 'farmtally-frontend\.next' not found. Please run 'npm run build' in farmtally-frontend directory first"
    }
    
    $frontendPackage = Join-Path $ArtifactPath "frontend\frontend.zip"
    
    # Create frontend package
    $frontendDir = "farmtally-frontend"
    $filesToCompress = @(".next", "public", "package.json", "package-lock.json", "next.config.ts")
    $existingFiles = $filesToCompress | ForEach-Object { 
        $fullPath = Join-Path $frontendDir $_
        if (Test-Path $fullPath) { $fullPath }
    }
    
    if ($existingFiles.Count -eq 0) {
        throw "ERROR: No frontend files found to package"
    }
    
    try {
        Compress-Archive -Path $existingFiles -DestinationPath $frontendPackage -Force
    } catch {
        throw "ERROR: Failed to create frontend package: $($_.Exception.Message)"
    }
    
    # Calculate checksum
    $checksum = (Get-FileHash $frontendPackage -Algorithm SHA256).Hash
    $checksumFile = Join-Path $ArtifactPath "frontend\frontend.sha256"
    $checksum | Out-File -FilePath $checksumFile -Encoding ASCII
    
    # Get package size
    $size = (Get-Item $frontendPackage).Length
    
    Write-Host "Frontend package created:"
    Write-Host "  File: $frontendPackage"
    Write-Host "  Size: $size bytes"
    Write-Host "  Checksum: $checksum"
    
    return [ComponentInfo]@{
        Name = "frontend"
        Type = "frontend"
        Path = "frontend/frontend.zip"
        Size = $size
        Checksum = $checksum
    }
}

function New-ArtifactManifest {
    param(
        [string]$ArtifactPath,
        [VersionInfo]$Version,
        [ComponentInfo]$BackendInfo,
        [ComponentInfo]$FrontendInfo
    )
    
    Write-Host "Generating artifact manifest..."
    
    # Get repository information
    try {
        $repoUrl = git config --get remote.origin.url 2>$null
        if (-not $repoUrl) { $repoUrl = "unknown" }
    } catch {
        $repoUrl = "unknown"
    }
    
    # Check if repository is dirty
    try {
        git diff-index --quiet HEAD -- 2>$null
        $isDirty = $LASTEXITCODE -ne 0
    } catch {
        $isDirty = $false
    }
    
    # Get Node and NPM versions
    try {
        $nodeVersion = node --version 2>$null
        if (-not $nodeVersion) { $nodeVersion = "unknown" }
    } catch {
        $nodeVersion = "unknown"
    }
    
    try {
        $npmVersion = npm --version 2>$null
        if (-not $npmVersion) { $npmVersion = "unknown" }
    } catch {
        $npmVersion = "unknown"
    }
    
    # Create manifest object
    $manifest = @{
        version = $Version.ArtifactVersion
        name = $Version.ArtifactName
        timestamp = $Version.BuildTimestamp
        git = @{
            commit = $Version.CommitSha
            shortCommit = $Version.CommitShort
            branch = $Version.BranchName
            repository = $repoUrl
            dirty = $isDirty
        }
        build = @{
            number = $Version.BuildNumber
            environment = if ($env:BUILD_ENV) { $env:BUILD_ENV } else { "production" }
            node = $nodeVersion
            npm = $npmVersion
        }
        components = @(
            @{
                name = $BackendInfo.Name
                type = $BackendInfo.Type
                path = $BackendInfo.Path
                size = $BackendInfo.Size
                checksum = $BackendInfo.Checksum
            },
            @{
                name = $FrontendInfo.Name
                type = $FrontendInfo.Type
                path = $FrontendInfo.Path
                size = $FrontendInfo.Size
                checksum = $FrontendInfo.Checksum
            }
        )
        metadata = @{
            creator = "$env:USERNAME@$env:COMPUTERNAME"
            platform = "$env:OS-$env:PROCESSOR_ARCHITECTURE"
            retentionDays = $RetentionDays
        }
    }
    
    # Write manifest JSON
    $manifestFile = Join-Path $ArtifactPath "manifest.json"
    $manifest | ConvertTo-Json -Depth 10 | Out-File -FilePath $manifestFile -Encoding UTF8
    
    Write-Host "Manifest created: $manifestFile"
    
    # Create human-readable summary
    $summaryFile = Join-Path $ArtifactPath "ARTIFACT_INFO.txt"
    $summary = @"
FarmTally Build Artifact
========================

Version: $($Version.ArtifactVersion)
Build Number: $($Version.BuildNumber)
Timestamp: $($Version.BuildTimestamp)

Git Information:
  Commit: $($Version.CommitSha)
  Branch: $($Version.BranchName)
  Repository: $repoUrl

Components:
  - Backend: backend/backend.zip
  - Frontend: frontend/frontend.zip

Build Environment:
  Node.js: $nodeVersion
  NPM: $npmVersion
  Platform: $env:OS-$env:PROCESSOR_ARCHITECTURE

Created by: $env:USERNAME@$env:COMPUTERNAME
"@
    
    $summary | Out-File -FilePath $summaryFile -Encoding UTF8
    Write-Host "Summary created: $summaryFile"
}

function Invoke-RetentionPolicy {
    Write-Host "Applying retention policy..."
    
    if (-not (Test-Path $ArtifactsDir)) {
        Write-Host "No artifacts directory found, skipping retention policy"
        return
    }
    
    # Remove artifacts older than retention period
    $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
    $oldArtifacts = Get-ChildItem -Path $ArtifactsDir -Directory -Name "farmtally-*" | 
        Where-Object { (Get-Item (Join-Path $ArtifactsDir $_)).CreationTime -lt $cutoffDate }
    
    $deletedCount = 0
    foreach ($oldArtifact in $oldArtifacts) {
        $artifactPath = Join-Path $ArtifactsDir $oldArtifact
        Write-Host "Removing old artifact: $oldArtifact"
        Remove-Item -Path $artifactPath -Recurse -Force
        $deletedCount++
    }
    
    if ($deletedCount -gt 0) {
        Write-Host "Removed $deletedCount old artifacts (older than $RetentionDays days)"
    }
    
    # Limit total number of artifacts
    $allArtifacts = Get-ChildItem -Path $ArtifactsDir -Directory -Name "farmtally-*" | 
        Sort-Object { (Get-Item (Join-Path $ArtifactsDir $_)).CreationTime } -Descending
    
    if ($allArtifacts.Count -gt $MaxArtifacts) {
        $excess = $allArtifacts.Count - $MaxArtifacts
        Write-Host "Too many artifacts ($($allArtifacts.Count)), removing $excess oldest artifacts"
        
        $artifactsToRemove = $allArtifacts | Select-Object -Last $excess
        foreach ($artifactToRemove in $artifactsToRemove) {
            $artifactPath = Join-Path $ArtifactsDir $artifactToRemove
            Write-Host "Removing excess artifact: $artifactToRemove"
            Remove-Item -Path $artifactPath -Recurse -Force
        }
    }
}

function Get-ArtifactList {
    Write-Host "Available artifacts:"
    Write-Host "==================="
    
    if (-not (Test-Path $ArtifactsDir)) {
        Write-Host "No artifacts directory found"
        return
    }
    
    $artifacts = Get-ChildItem -Path $ArtifactsDir -Directory -Name "farmtally-*"
    
    if ($artifacts.Count -eq 0) {
        Write-Host "No artifacts found"
        return
    }
    
    foreach ($artifact in $artifacts) {
        $manifestFile = Join-Path $ArtifactsDir $artifact "manifest.json"
        
        if (Test-Path $manifestFile) {
            try {
                $manifest = Get-Content $manifestFile | ConvertFrom-Json
                $timestamp = $manifest.timestamp
                $commit = $manifest.git.shortCommit
                Write-Host "  $artifact (commit: $commit, created: $timestamp)"
            } catch {
                Write-Host "  $artifact (invalid manifest)"
            }
        } else {
            Write-Host "  $artifact (no manifest)"
        }
    }
    
    Write-Host ""
    Write-Host "Total: $($artifacts.Count) artifacts"
}

function Test-ArtifactIntegrity {
    param([string]$ArtifactName)
    
    $artifactPath = Join-Path $ArtifactsDir $ArtifactName
    
    if (-not (Test-Path $artifactPath)) {
        throw "ERROR: Artifact not found: $ArtifactName"
    }
    
    Write-Host "Verifying artifact: $ArtifactName"
    
    $errors = 0
    
    # Check backend integrity
    $backendPackage = Join-Path $artifactPath "backend\backend.zip"
    $backendChecksum = Join-Path $artifactPath "backend\backend.sha256"
    
    if ((Test-Path $backendPackage) -and (Test-Path $backendChecksum)) {
        $expectedChecksum = (Get-Content $backendChecksum).Trim()
        $actualChecksum = (Get-FileHash $backendPackage -Algorithm SHA256).Hash
        
        if ($expectedChecksum -eq $actualChecksum) {
            Write-Host "  ✓ Backend integrity verified"
        } else {
            Write-Host "  ✗ Backend integrity check failed"
            Write-Host "    Expected: $expectedChecksum"
            Write-Host "    Actual:   $actualChecksum"
            $errors++
        }
    } else {
        Write-Host "  ✗ Backend checksum file missing"
        $errors++
    }
    
    # Check frontend integrity
    $frontendPackage = Join-Path $artifactPath "frontend\frontend.zip"
    $frontendChecksum = Join-Path $artifactPath "frontend\frontend.sha256"
    
    if ((Test-Path $frontendPackage) -and (Test-Path $frontendChecksum)) {
        $expectedChecksum = (Get-Content $frontendChecksum).Trim()
        $actualChecksum = (Get-FileHash $frontendPackage -Algorithm SHA256).Hash
        
        if ($expectedChecksum -eq $actualChecksum) {
            Write-Host "  ✓ Frontend integrity verified"
        } else {
            Write-Host "  ✗ Frontend integrity check failed"
            Write-Host "    Expected: $expectedChecksum"
            Write-Host "    Actual:   $actualChecksum"
            $errors++
        }
    } else {
        Write-Host "  ✗ Frontend checksum file missing"
        $errors++
    }
    
    # Check manifest
    $manifestFile = Join-Path $artifactPath "manifest.json"
    if (Test-Path $manifestFile) {
        try {
            Get-Content $manifestFile | ConvertFrom-Json | Out-Null
            Write-Host "  ✓ Manifest is valid JSON"
        } catch {
            Write-Host "  ✗ Manifest is invalid JSON"
            $errors++
        }
    } else {
        Write-Host "  ✗ Manifest file missing"
        $errors++
    }
    
    if ($errors -eq 0) {
        Write-Host "Artifact verification successful"
        return $true
    } else {
        Write-Host "Artifact verification failed with $errors errors"
        return $false
    }
}

function Show-Help {
    Write-Host "FarmTally Artifact Manager (PowerShell)"
    Write-Host ""
    Write-Host "Usage: .\artifact-manager.ps1 [command] [options]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  create    Create new artifact from current build (default)"
    Write-Host "  list      List all available artifacts"
    Write-Host "  verify    Verify artifact integrity"
    Write-Host "  clean     Apply retention policy and clean old artifacts"
    Write-Host "  help      Show this help message"
    Write-Host ""
    Write-Host "Parameters:"
    Write-Host "  -ArtifactName     Artifact name for verify command"
    Write-Host "  -RetentionDays    Days to keep artifacts (default: 30)"
    Write-Host "  -MaxArtifacts     Maximum number of artifacts (default: 50)"
    Write-Host "  -ArtifactsDir     Artifacts directory (default: artifacts)"
    Write-Host ""
    Write-Host "Environment Variables:"
    Write-Host "  BUILD_NUMBER      Build number (default: timestamp)"
    Write-Host "  BUILD_ENV         Build environment (default: production)"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\artifact-manager.ps1 create"
    Write-Host "  .\artifact-manager.ps1 list"
    Write-Host "  .\artifact-manager.ps1 verify -ArtifactName farmtally-v123-abc12345"
    Write-Host "  .\artifact-manager.ps1 clean"
}

# Main execution
try {
    switch ($Command) {
        "create" {
            Write-Host "Creating new artifact..."
            
            $version = Get-VersionInfo
            $artifactPath = New-ArtifactDirectory -Version $version
            $backendInfo = New-BackendPackage -ArtifactPath $artifactPath
            $frontendInfo = New-FrontendPackage -ArtifactPath $artifactPath
            
            New-ArtifactManifest -ArtifactPath $artifactPath -Version $version -BackendInfo $backendInfo -FrontendInfo $frontendInfo
            Invoke-RetentionPolicy
            
            Write-Host ""
            Write-Host "Artifact created successfully: $($version.ArtifactName)"
            Write-Host "Location: $artifactPath"
        }
        
        "list" {
            Get-ArtifactList
        }
        
        "verify" {
            if (-not $ArtifactName) {
                throw "Usage: .\artifact-manager.ps1 verify -ArtifactName <artifact-name>"
            }
            $result = Test-ArtifactIntegrity -ArtifactName $ArtifactName
            if (-not $result) { exit 1 }
        }
        
        "clean" {
            Invoke-RetentionPolicy
        }
        
        "help" {
            Show-Help
        }
        
        default {
            throw "Unknown command: $Command"
        }
    }
} catch {
    Write-Error $_.Exception.Message
    exit 1
}