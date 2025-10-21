@echo off
REM Pipeline Monitor Windows Batch Script
REM Wrapper for pipeline-monitor.js

setlocal enabledelayedexpansion

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    exit /b 1
)

REM Get script directory
set SCRIPT_DIR=%~dp0

REM Run the Node.js monitor script
node "%SCRIPT_DIR%pipeline-monitor.js" %*

REM Exit with the same code as the Node.js script
exit /b %errorlevel%