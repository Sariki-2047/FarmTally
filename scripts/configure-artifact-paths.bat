@echo off
REM FarmTally Artifact Path Configuration Script (Windows)
REM This script configures and validates artifact upload paths for Jenkins deployment

setlocal enabledelayedexpansion

set "action=%1"
if "%action%"=="" set "action=configure"

set "BACKEND_ROOT=."
set "FRONTEND_ROOT=farmtally-frontend"
if "%VPS_HOST%"=="" set "VPS_HOST=147.93.153.247"
if "%VPS_USER%"=="" set "VPS_USER=root"
if "%APP_DIR%"=="" set "APP_DIR=/opt/farmtally"

echo 🔧 FarmTally Artifact Path Configuration
echo ========================================

if "%action%"=="validate" (
    call :validate_artifact_paths
) else if "%action%"=="configure" (
    call :validate_artifact_paths
    if !errorlevel! equ 0 (
        call :generate_scp_commands
        call :create_artifact_manifest
        call :display_artifact_summary
        echo ✅ Artifact configuration completed successfully
    )
) else if "%action%"=="summary" (
    call :display_artifact_summary
) else (
    echo ❌ Unknown action: %action%
    echo Usage: %0 [validate^|configure^|summary]
    exit /b 1
)

exit /b 0

:validate_artifact_paths
echo ℹ️  Validating artifact paths...

set "validation_failed=false"

REM Backend artifacts
if not exist "%BACKEND_ROOT%\dist" (
    echo ❌ Backend build artifacts not found at %BACKEND_ROOT%\dist
    set "validation_failed=true"
) else (
    echo ✅ Backend artifacts found at %BACKEND_ROOT%\dist
)

if not exist "%BACKEND_ROOT%\dist\server.js" (
    echo ❌ Backend server.js not found at %BACKEND_ROOT%\dist\server.js
    set "validation_failed=true"
) else (
    echo ✅ Backend server.js found
)

REM Frontend artifacts
if not exist "%FRONTEND_ROOT%\.next" (
    echo ❌ Frontend build artifacts not found at %FRONTEND_ROOT%\.next
    set "validation_failed=true"
) else (
    echo ✅ Frontend artifacts found at %FRONTEND_ROOT%\.next
)

REM Package files
if not exist "%BACKEND_ROOT%\package.json" (
    echo ❌ Backend package.json not found at %BACKEND_ROOT%\package.json
    set "validation_failed=true"
) else (
    echo ✅ Backend package.json found
)

if "%validation_failed%"=="true" (
    echo ❌ Artifact validation failed
    exit /b 1
)

echo ✅ All artifacts validated successfully
exit /b 0

:generate_scp_commands
echo ℹ️  Generating SCP upload commands...

(
echo #!/bin/bash
echo # Generated SCP commands for FarmTally artifact upload
echo # Generated on: %date% %time%
echo.
echo set -e
echo.
echo VPS_HOST="%VPS_HOST%"
echo VPS_USER="%VPS_USER%"
echo APP_DIR="%APP_DIR%"
echo.
echo echo "🚀 Starting artifact upload to VPS..."
echo.
echo # Create remote directories
echo echo "📁 Creating remote directories..."
echo ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} '
echo     mkdir -p ${APP_DIR}/backend
echo     mkdir -p ${APP_DIR}/frontend
echo     mkdir -p ${APP_DIR}/logs
echo     mkdir -p ${APP_DIR}/backups
echo '
echo.
echo # Upload backend artifacts
echo echo "📤 Uploading backend artifacts..."
echo scp -r %BACKEND_ROOT%/dist/* ${VPS_USER}@${VPS_HOST}:${APP_DIR}/backend/
echo scp %BACKEND_ROOT%/package.json ${VPS_USER}@${VPS_HOST}:${APP_DIR}/backend/
echo scp %BACKEND_ROOT%/package-lock.json ${VPS_USER}@${VPS_HOST}:${APP_DIR}/backend/ ^|^| echo "⚠️  package-lock.json not found, skipping"
echo.
echo # Upload frontend artifacts
echo echo "📤 Uploading frontend artifacts..."
echo scp -r %FRONTEND_ROOT%/.next/* ${VPS_USER}@${VPS_HOST}:${APP_DIR}/frontend/
echo.
echo # Upload Prisma schema for migrations
echo echo "📤 Uploading database schema..."
echo scp -r prisma ${VPS_USER}@${VPS_HOST}:${APP_DIR}/
echo.
echo echo "✅ All artifacts uploaded successfully"
) > artifact-upload-commands.sh

echo ✅ SCP commands generated in artifact-upload-commands.sh
exit /b 0

:create_artifact_manifest
echo ℹ️  Creating artifact manifest...

(
echo {
echo     "timestamp": "%date% %time%",
echo     "buildNumber": "%BUILD_NUMBER%",
echo     "gitCommit": "%GIT_COMMIT%",
echo     "gitBranch": "%GIT_BRANCH%",
echo     "artifacts": {
echo         "backend": {
echo             "root": "%BACKEND_ROOT%",
echo             "dist": "%BACKEND_ROOT%/dist",
echo             "files": [
echo                 "%BACKEND_ROOT%/dist/server.js",
echo                 "%BACKEND_ROOT%/package.json",
echo                 "%BACKEND_ROOT%/package-lock.json"
echo             ]
echo         },
echo         "frontend": {
echo             "root": "%FRONTEND_ROOT%",
echo             "dist": "%FRONTEND_ROOT%/.next",
echo             "static": "%FRONTEND_ROOT%/out"
echo         },
echo         "database": {
echo             "schema": "prisma/schema.prisma",
echo             "migrations": "prisma/migrations"
echo         }
echo     },
echo     "deployment": {
echo         "vpsHost": "%VPS_HOST%",
echo         "vpsUser": "%VPS_USER%",
echo         "appDir": "%APP_DIR%",
echo         "uploadMethod": "scp"
echo     }
echo }
) > artifact-manifest.json

echo ✅ Artifact manifest created: artifact-manifest.json
exit /b 0

:display_artifact_summary
echo ℹ️  Artifact Summary:
echo ==================

echo 📦 Backend Artifacts:
echo    Root: %BACKEND_ROOT%
echo    Build Output: %BACKEND_ROOT%\dist
if exist "%BACKEND_ROOT%\dist" (
    for /f %%A in ('dir "%BACKEND_ROOT%\dist" /s /-c ^| find "File(s)"') do echo    Files: %%A
)

echo.
echo 🎨 Frontend Artifacts:
echo    Root: %FRONTEND_ROOT%
echo    Build Output: %FRONTEND_ROOT%\.next
if exist "%FRONTEND_ROOT%\.next" (
    for /f %%A in ('dir "%FRONTEND_ROOT%\.next" /s /-c ^| find "File(s)"') do echo    Files: %%A
)

echo.
echo 🎯 Deployment Target:
echo    VPS Host: %VPS_HOST%
echo    VPS User: %VPS_USER%
echo    App Directory: %APP_DIR%

echo ==================
exit /b 0