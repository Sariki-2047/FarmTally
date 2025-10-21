@echo off
REM Staging Environment Validation Windows Batch Script
REM Wrapper for staging-validation.js

setlocal enabledelayedexpansion

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    exit /b 1
)

REM Get script directory
set SCRIPT_DIR=%~dp0

REM Set staging environment variables if not already set
if not defined STAGING_URL (
    set STAGING_URL=http://localhost:3000
    echo Using default STAGING_URL: %STAGING_URL%
)

REM Run the Node.js validation script
node "%SCRIPT_DIR%staging-validation.js" %*

REM Exit with the same code as the Node.js script
exit /b %errorlevel%