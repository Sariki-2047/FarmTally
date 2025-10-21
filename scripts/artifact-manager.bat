@echo off
setlocal enabledelayedexpansion

REM FarmTally Artifact Management System (Windows)
REM Handles versioning, packaging, and storage of build artifacts

set "ARTIFACTS_DIR=artifacts"
set "RETENTION_DAYS=30"
set "MAX_ARTIFACTS=50"

REM Get version information
call :get_version_info

REM Main command dispatcher
set "COMMAND=%~1"
if "%COMMAND%"=="" set "COMMAND=create"

if "%COMMAND%"=="create" goto :create_artifact
if "%COMMAND%"=="list" goto :list_artifacts
if "%COMMAND%"=="verify" goto :verify_artifact
if "%COMMAND%"=="clean" goto :clean_artifacts
if "%COMMAND%"=="help" goto :show_help
if "%COMMAND%"=="-h" goto :show_help
if "%COMMAND%"=="--help" goto :show_help

echo Unknown command: %COMMAND%
echo Use '%~nx0 help' for usage information
exit /b 1

:get_version_info
REM Get Git information
for /f "tokens=*" %%i in ('git rev-parse HEAD 2^>nul') do set "COMMIT_SHA=%%i"
if "%COMMIT_SHA%"=="" set "COMMIT_SHA=unknown"

set "COMMIT_SHORT=%COMMIT_SHA:~0,8%"

REM Get build number
if "%BUILD_NUMBER%"=="" (
    for /f "tokens=*" %%i in ('powershell -command "[int][double]::Parse((Get-Date -UFormat %%s))"') do set "BUILD_NUMBER=%%i"
)

REM Get timestamp
for /f "tokens=*" %%i in ('powershell -command "(Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')"') do set "BUILD_TIMESTAMP=%%i"

REM Get branch name
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "BRANCH_NAME=%%i"
if "%BRANCH_NAME%"=="" set "BRANCH_NAME=unknown"

set "ARTIFACT_VERSION=v%BUILD_NUMBER%-%COMMIT_SHORT%"
set "ARTIFACT_NAME=farmtally-%ARTIFACT_VERSION%"

echo Version Info:
echo   Commit SHA: %COMMIT_SHA%
echo   Build Number: %BUILD_NUMBER%
echo   Artifact Version: %ARTIFACT_VERSION%
echo   Branch: %BRANCH_NAME%
echo   Timestamp: %BUILD_TIMESTAMP%
goto :eof

:create_artifact
echo Creating new artifact...

REM Setup artifact directory
set "ARTIFACT_PATH=%ARTIFACTS_DIR%\%ARTIFACT_NAME%"
echo Setting up artifact directory: %ARTIFACT_PATH%

if not exist "%ARTIFACT_PATH%" mkdir "%ARTIFACT_PATH%"
if not exist "%ARTIFACT_PATH%\backend" mkdir "%ARTIFACT_PATH%\backend"
if not exist "%ARTIFACT_PATH%\frontend" mkdir "%ARTIFACT_PATH%\frontend"
if not exist "%ARTIFACT_PATH%\metadata" mkdir "%ARTIFACT_PATH%\metadata"

REM Package backend
call :package_backend "%ARTIFACT_PATH%"
if errorlevel 1 exit /b 1

REM Package frontend
call :package_frontend "%ARTIFACT_PATH%"
if errorlevel 1 exit /b 1

REM Generate manifest
call :generate_manifest "%ARTIFACT_PATH%"

REM Apply retention policy
call :apply_retention_policy

echo.
echo Artifact created successfully: %ARTIFACT_NAME%
echo Location: %ARTIFACT_PATH%
goto :eof

:package_backend
set "ARTIFACT_PATH=%~1"
set "BACKEND_PACKAGE=%ARTIFACT_PATH%\backend\backend.tar.gz"

echo Packaging backend artifacts...

REM Verify backend build exists
if not exist "dist" (
    echo ERROR: Backend build directory 'dist' not found
    echo Please run 'npm run build' first
    exit /b 1
)

REM Create backend package using tar (if available) or PowerShell
where tar >nul 2>&1
if %errorlevel%==0 (
    tar -czf "%BACKEND_PACKAGE%" --exclude=node_modules --exclude=.env* --exclude=*.log dist package.json package-lock.json prisma
) else (
    REM Use PowerShell as fallback
    powershell -command "Compress-Archive -Path 'dist','package.json','package-lock.json','prisma' -DestinationPath '%ARTIFACT_PATH%\backend\backend.zip' -Force"
    set "BACKEND_PACKAGE=%ARTIFACT_PATH%\backend\backend.zip"
)

if not exist "%BACKEND_PACKAGE%" (
    echo ERROR: Failed to create backend package
    exit /b 1
)

REM Calculate checksum using PowerShell
for /f "tokens=*" %%i in ('powershell -command "(Get-FileHash '%BACKEND_PACKAGE%' -Algorithm SHA256).Hash"') do set "BACKEND_CHECKSUM=%%i"
echo %BACKEND_CHECKSUM% > "%ARTIFACT_PATH%\backend\backend.sha256"

REM Get package size
for %%i in ("%BACKEND_PACKAGE%") do set "BACKEND_SIZE=%%~zi"

echo Backend package created:
echo   File: %BACKEND_PACKAGE%
echo   Size: %BACKEND_SIZE% bytes
echo   Checksum: %BACKEND_CHECKSUM%

goto :eof

:package_frontend
set "ARTIFACT_PATH=%~1"
set "FRONTEND_PACKAGE=%ARTIFACT_PATH%\frontend\frontend.tar.gz"

echo Packaging frontend artifacts...

REM Verify frontend build exists
if not exist "farmtally-frontend\.next" (
    echo ERROR: Frontend build directory 'farmtally-frontend\.next' not found
    echo Please run 'npm run build' in farmtally-frontend directory first
    exit /b 1
)

REM Create frontend package
where tar >nul 2>&1
if %errorlevel%==0 (
    tar -czf "%FRONTEND_PACKAGE%" -C farmtally-frontend --exclude=node_modules --exclude=.env* --exclude=*.log .next public package.json package-lock.json next.config.ts
) else (
    REM Use PowerShell as fallback
    powershell -command "Set-Location 'farmtally-frontend'; Compress-Archive -Path '.next','public','package.json','package-lock.json','next.config.ts' -DestinationPath '..\%ARTIFACT_PATH%\frontend\frontend.zip' -Force"
    set "FRONTEND_PACKAGE=%ARTIFACT_PATH%\frontend\frontend.zip"
)

if not exist "%FRONTEND_PACKAGE%" (
    echo ERROR: Failed to create frontend package
    exit /b 1
)

REM Calculate checksum
for /f "tokens=*" %%i in ('powershell -command "(Get-FileHash '%FRONTEND_PACKAGE%' -Algorithm SHA256).Hash"') do set "FRONTEND_CHECKSUM=%%i"
echo %FRONTEND_CHECKSUM% > "%ARTIFACT_PATH%\frontend\frontend.sha256"

REM Get package size
for %%i in ("%FRONTEND_PACKAGE%") do set "FRONTEND_SIZE=%%~zi"

echo Frontend package created:
echo   File: %FRONTEND_PACKAGE%
echo   Size: %FRONTEND_SIZE% bytes
echo   Checksum: %FRONTEND_CHECKSUM%

goto :eof

:generate_manifest
set "ARTIFACT_PATH=%~1"
set "MANIFEST_FILE=%ARTIFACT_PATH%\manifest.json"

echo Generating artifact manifest...

REM Get repository URL
for /f "tokens=*" %%i in ('git config --get remote.origin.url 2^>nul') do set "REPO_URL=%%i"
if "%REPO_URL%"=="" set "REPO_URL=unknown"

REM Check if repository is dirty
git diff-index --quiet HEAD -- 2>nul
if errorlevel 1 (
    set "DIRTY_FLAG=true"
) else (
    set "DIRTY_FLAG=false"
)

REM Get Node and NPM versions
for /f "tokens=*" %%i in ('node --version 2^>nul') do set "NODE_VERSION=%%i"
if "%NODE_VERSION%"=="" set "NODE_VERSION=unknown"

for /f "tokens=*" %%i in ('npm --version 2^>nul') do set "NPM_VERSION=%%i"
if "%NPM_VERSION%"=="" set "NPM_VERSION=unknown"

REM Create manifest JSON
(
echo {
echo   "version": "%ARTIFACT_VERSION%",
echo   "name": "%ARTIFACT_NAME%",
echo   "timestamp": "%BUILD_TIMESTAMP%",
echo   "git": {
echo     "commit": "%COMMIT_SHA%",
echo     "shortCommit": "%COMMIT_SHORT%",
echo     "branch": "%BRANCH_NAME%",
echo     "repository": "%REPO_URL%",
echo     "dirty": %DIRTY_FLAG%
echo   },
echo   "build": {
echo     "number": "%BUILD_NUMBER%",
echo     "environment": "%BUILD_ENV%",
echo     "node": "%NODE_VERSION%",
echo     "npm": "%NPM_VERSION%"
echo   },
echo   "components": [
echo     {
echo       "name": "backend",
echo       "type": "backend",
echo       "path": "backend/backend.tar.gz",
echo       "size": %BACKEND_SIZE%,
echo       "checksum": "%BACKEND_CHECKSUM%"
echo     },
echo     {
echo       "name": "frontend",
echo       "type": "frontend", 
echo       "path": "frontend/frontend.tar.gz",
echo       "size": %FRONTEND_SIZE%,
echo       "checksum": "%FRONTEND_CHECKSUM%"
echo     }
echo   ],
echo   "metadata": {
echo     "creator": "%USERNAME%@%COMPUTERNAME%",
echo     "platform": "%OS%-%PROCESSOR_ARCHITECTURE%",
echo     "retentionDays": %RETENTION_DAYS%
echo   }
echo }
) > "%MANIFEST_FILE%"

echo Manifest created: %MANIFEST_FILE%

REM Create human-readable summary
set "SUMMARY_FILE=%ARTIFACT_PATH%\ARTIFACT_INFO.txt"
(
echo FarmTally Build Artifact
echo ========================
echo.
echo Version: %ARTIFACT_VERSION%
echo Build Number: %BUILD_NUMBER%
echo Timestamp: %BUILD_TIMESTAMP%
echo.
echo Git Information:
echo   Commit: %COMMIT_SHA%
echo   Branch: %BRANCH_NAME%
echo   Repository: %REPO_URL%
echo.
echo Components:
echo   - Backend: backend/backend.tar.gz
echo   - Frontend: frontend/frontend.tar.gz
echo.
echo Build Environment:
echo   Node.js: %NODE_VERSION%
echo   NPM: %NPM_VERSION%
echo   Platform: %OS%-%PROCESSOR_ARCHITECTURE%
echo.
echo Created by: %USERNAME%@%COMPUTERNAME%
) > "%SUMMARY_FILE%"

echo Summary created: %SUMMARY_FILE%
goto :eof

:list_artifacts
echo Available artifacts:
echo ===================

if not exist "%ARTIFACTS_DIR%" (
    echo No artifacts directory found
    goto :eof
)

set "COUNT=0"
for /d %%i in ("%ARTIFACTS_DIR%\farmtally-*") do (
    set "ARTIFACT_NAME=%%~nxi"
    set "MANIFEST_FILE=%%i\manifest.json"
    
    if exist "!MANIFEST_FILE!" (
        REM Extract version info from manifest (simplified)
        echo   !ARTIFACT_NAME!
    ) else (
        echo   !ARTIFACT_NAME! ^(no manifest^)
    )
    set /a COUNT+=1
)

if %COUNT%==0 (
    echo No artifacts found
) else (
    echo.
    echo Total: %COUNT% artifacts
)
goto :eof

:verify_artifact
set "ARTIFACT_NAME=%~2"
if "%ARTIFACT_NAME%"=="" (
    echo Usage: %~nx0 verify ^<artifact-name^>
    exit /b 1
)

set "ARTIFACT_PATH=%ARTIFACTS_DIR%\%ARTIFACT_NAME%"
if not exist "%ARTIFACT_PATH%" (
    echo ERROR: Artifact not found: %ARTIFACT_NAME%
    exit /b 1
)

echo Verifying artifact: %ARTIFACT_NAME%

set "ERRORS=0"

REM Check backend integrity
if exist "%ARTIFACT_PATH%\backend\backend.tar.gz" if exist "%ARTIFACT_PATH%\backend\backend.sha256" (
    set /p EXPECTED_CHECKSUM=<"%ARTIFACT_PATH%\backend\backend.sha256"
    for /f "tokens=*" %%i in ('powershell -command "(Get-FileHash '%ARTIFACT_PATH%\backend\backend.tar.gz' -Algorithm SHA256).Hash"') do set "ACTUAL_CHECKSUM=%%i"
    
    if "!EXPECTED_CHECKSUM!"=="!ACTUAL_CHECKSUM!" (
        echo   ✓ Backend integrity verified
    ) else (
        echo   ✗ Backend integrity check failed
        echo     Expected: !EXPECTED_CHECKSUM!
        echo     Actual:   !ACTUAL_CHECKSUM!
        set /a ERRORS+=1
    )
) else (
    echo   ✗ Backend checksum file missing
    set /a ERRORS+=1
)

REM Check frontend integrity
if exist "%ARTIFACT_PATH%\frontend\frontend.tar.gz" if exist "%ARTIFACT_PATH%\frontend\frontend.sha256" (
    set /p EXPECTED_CHECKSUM=<"%ARTIFACT_PATH%\frontend\frontend.sha256"
    for /f "tokens=*" %%i in ('powershell -command "(Get-FileHash '%ARTIFACT_PATH%\frontend\frontend.tar.gz' -Algorithm SHA256).Hash"') do set "ACTUAL_CHECKSUM=%%i"
    
    if "!EXPECTED_CHECKSUM!"=="!ACTUAL_CHECKSUM!" (
        echo   ✓ Frontend integrity verified
    ) else (
        echo   ✗ Frontend integrity check failed
        echo     Expected: !EXPECTED_CHECKSUM!
        echo     Actual:   !ACTUAL_CHECKSUM!
        set /a ERRORS+=1
    )
) else (
    echo   ✗ Frontend checksum file missing
    set /a ERRORS+=1
)

REM Check manifest
if exist "%ARTIFACT_PATH%\manifest.json" (
    echo   ✓ Manifest exists
) else (
    echo   ✗ Manifest file missing
    set /a ERRORS+=1
)

if %ERRORS%==0 (
    echo Artifact verification successful
    exit /b 0
) else (
    echo Artifact verification failed with %ERRORS% errors
    exit /b 1
)

:apply_retention_policy
echo Applying retention policy...

if not exist "%ARTIFACTS_DIR%" (
    echo No artifacts directory found, skipping retention policy
    goto :eof
)

REM Simple retention - remove oldest artifacts if over limit
set "COUNT=0"
for /d %%i in ("%ARTIFACTS_DIR%\farmtally-*") do set /a COUNT+=1

if %COUNT% gtr %MAX_ARTIFACTS% (
    set /a EXCESS=%COUNT%-%MAX_ARTIFACTS%
    echo Too many artifacts ^(%COUNT%^), removing !EXCESS! oldest artifacts
    
    REM This is a simplified version - in production you'd want more sophisticated cleanup
    echo Note: Automated cleanup not fully implemented in Windows version
    echo Please manually remove old artifacts from %ARTIFACTS_DIR%
)
goto :eof

:clean_artifacts
call :apply_retention_policy
goto :eof

:show_help
echo FarmTally Artifact Manager ^(Windows^)
echo.
echo Usage: %~nx0 [command] [options]
echo.
echo Commands:
echo   create    Create new artifact from current build ^(default^)
echo   list      List all available artifacts
echo   verify    Verify artifact integrity
echo   clean     Apply retention policy and clean old artifacts
echo   help      Show this help message
echo.
echo Environment Variables:
echo   BUILD_NUMBER    Build number ^(default: timestamp^)
echo   BUILD_ENV       Build environment ^(default: production^)
echo.
echo Examples:
echo   %~nx0 create                    # Create new artifact
echo   %~nx0 list                      # List artifacts
echo   %~nx0 verify farmtally-v123-abc12345  # Verify specific artifact
echo   %~nx0 clean                     # Clean old artifacts
goto :eof