@echo off
REM FarmTally Build Path Existence Check Script (Windows)
REM This script checks if all required paths exist before executing build commands

setlocal enabledelayedexpansion

set "stage=%1"
if "%stage%"=="" set "stage=pre-build"

echo 🔍 Checking build paths for stage: %stage%
echo ============================================

if "%stage%"=="pre-build" (
    echo 📋 Pre-build path validation...
    
    REM Backend source paths
    call :check_required_path "package.json" "Backend package.json"
    call :check_required_path "src" "Backend source directory"
    call :check_required_path "src\server.ts" "Backend main server file"
    call :check_required_path "tsconfig.json" "TypeScript configuration"
    
    REM Frontend source paths
    call :check_required_path "farmtally-frontend" "Frontend directory"
    call :check_required_path "farmtally-frontend\package.json" "Frontend package.json"
    call :check_required_path "farmtally-frontend\src" "Frontend source directory"
    
    REM Database paths
    call :check_required_path "prisma" "Prisma directory"
    call :check_required_path "prisma\schema.prisma" "Prisma schema"
    
    echo ✅ All pre-build paths verified
    
) else if "%stage%"=="post-build" (
    echo 📦 Post-build artifact validation...
    
    REM Backend build artifacts
    call :check_required_path "dist" "Backend build output"
    call :check_required_path "dist\server.js" "Backend compiled server"
    
    REM Frontend build artifacts
    call :check_required_path "farmtally-frontend\.next" "Frontend build output"
    
    REM Optional static export
    call :check_optional_path "farmtally-frontend\out" "Frontend static export"
    
    echo ✅ All build artifacts verified
    
) else if "%stage%"=="pre-deploy" (
    echo 🚀 Pre-deployment artifact validation...
    
    REM Verify all deployment artifacts exist
    call :check_required_path "dist" "Backend deployment artifacts"
    call :check_required_path "dist\server.js" "Backend server executable"
    call :check_required_path "package.json" "Backend package.json for dependencies"
    call :check_required_path "farmtally-frontend\.next" "Frontend deployment artifacts"
    
    REM Check artifact sizes (basic validation)
    if exist "dist\server.js" (
        for %%A in ("dist\server.js") do set "size=%%~zA"
        if !size! gtr 1000 (
            echo ✅ Backend server.js size: !size! bytes
        ) else (
            echo ❌ Backend server.js too small: !size! bytes
            exit /b 1
        )
    )
    
    echo ✅ All deployment artifacts verified
    
) else (
    echo ❌ Unknown stage: %stage%
    echo Usage: %0 [pre-build^|post-build^|pre-deploy]
    exit /b 1
)

echo ============================================
echo 🎉 Path validation completed for stage: %stage%
exit /b 0

:check_required_path
if exist "%~1" (
    echo ✅ %~2: %~1
) else (
    echo ❌ MISSING: %~2 at %~1
    echo Build cannot continue without this path
    exit /b 1
)
goto :eof

:check_optional_path
if exist "%~1" (
    echo ✅ %~2: %~1
) else (
    echo ⚠️  OPTIONAL: %~2 not found at %~1
)
goto :eof