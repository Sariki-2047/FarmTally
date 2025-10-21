@echo off
REM FarmTally Health Check Script for Windows
REM Wrapper script for local development and testing

setlocal enabledelayedexpansion

REM Default values
set "API_URL=http://localhost:3000"
set "SERVICE_TOKEN="
set "TIMEOUT=10000"
set "RETRIES=3"
set "VERBOSE=false"
set "JSON_OUTPUT=false"

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :execute_health_check
if "%~1"=="--url" (
    set "API_URL=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--token" (
    set "SERVICE_TOKEN=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--timeout" (
    set "TIMEOUT=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--retries" (
    set "RETRIES=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--verbose" (
    set "VERBOSE=true"
    shift
    goto :parse_args
)
if "%~1"=="--json" (
    set "JSON_OUTPUT=true"
    shift
    goto :parse_args
)
if "%~1"=="--help" (
    goto :show_help
)
echo Unknown option: %~1
echo Use --help for usage information
exit /b 1

:show_help
echo FarmTally Health Check Script
echo.
echo Usage: %~nx0 [options]
echo.
echo Options:
echo   --url ^<url^>          Base URL of the API (default: http://localhost:3000)
echo   --token ^<token^>      Service token for authenticated requests
echo   --timeout ^<ms^>       Request timeout in milliseconds (default: 10000)
echo   --retries ^<count^>    Number of retries for failed requests (default: 3)
echo   --verbose            Enable verbose logging
echo   --json               Output results in JSON format
echo   --help               Show this help message
echo.
echo Environment Variables:
echo   API_URL              Base URL of the API
echo   SERVICE_TOKEN        Service token for authenticated requests
echo   JWT_SECRET           JWT secret for generating temporary tokens
echo   TIMEOUT              Request timeout in milliseconds
echo   RETRIES              Number of retries for failed requests
echo   VERBOSE              Enable verbose logging (true/false)
echo   JSON_OUTPUT          Output results in JSON format (true/false)
echo.
echo Examples:
echo   %~nx0
echo   %~nx0 --url https://api.farmtally.com --verbose
echo   %~nx0 --token eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
echo   %~nx0 --json ^> health-report.json
exit /b 0

:execute_health_check
REM Get script directory and project root
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."

REM Change to project root directory
cd /d "%PROJECT_ROOT%"

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed or not in PATH
    exit /b 1
)

REM Check if the health check script exists
if not exist "scripts\health-check.js" (
    echo ❌ Error: Health check script not found at scripts\health-check.js
    exit /b 1
)

REM Check if axios is available (required dependency)
node -e "require('axios')" >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: axios package is not installed. Run 'npm install' first.
    exit /b 1
)

REM Check if jsonwebtoken is available (required dependency)
node -e "require('jsonwebtoken')" >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: jsonwebtoken package is not installed. Run 'npm install' first.
    exit /b 1
)

REM Build node command arguments
set "NODE_ARGS=--url %API_URL%"

if not "%SERVICE_TOKEN%"=="" (
    set "NODE_ARGS=%NODE_ARGS% --token %SERVICE_TOKEN%"
)

set "NODE_ARGS=%NODE_ARGS% --timeout %TIMEOUT%"
set "NODE_ARGS=%NODE_ARGS% --retries %RETRIES%"

if "%VERBOSE%"=="true" (
    set "NODE_ARGS=%NODE_ARGS% --verbose"
)

if "%JSON_OUTPUT%"=="true" (
    set "NODE_ARGS=%NODE_ARGS% --json"
)

REM Run the health check
echo 🏥 Starting FarmTally health checks...
echo 📍 API URL: %API_URL%

if "%VERBOSE%"=="true" (
    echo ⚙️  Configuration:
    echo    - Timeout: %TIMEOUT%ms
    echo    - Retries: %RETRIES%
    if not "%SERVICE_TOKEN%"=="" (
        echo    - Service Token: [PROVIDED]
    ) else (
        echo    - Service Token: [NOT PROVIDED]
    )
    echo.
)

REM Execute the health check
node scripts\health-check.js %NODE_ARGS%
set "EXIT_CODE=%ERRORLEVEL%"

if %EXIT_CODE% equ 0 (
    echo.
    echo ✅ All health checks passed successfully!
) else (
    echo.
    echo ❌ Health checks failed with exit code %EXIT_CODE%
)

exit /b %EXIT_CODE%