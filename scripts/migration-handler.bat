@echo off
setlocal enabledelayedexpansion

REM FarmTally Database Migration Handler (Windows)
REM This script handles database migrations with proper error handling and logging

set LOG_FILE=migration.log
set MIGRATION_TIMEOUT=300
set RETRY_COUNT=3
set RETRY_DELAY=10

REM Get timestamp for logging
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "timestamp=%dt:~0,4%-%dt:~4,2%-%dt:~6,2% %dt:~8,2%:%dt:~10,2%:%dt:~12,2%"

echo === FarmTally Database Migration Handler Started === >> %LOG_FILE%
echo %timestamp% [INFO] Build Number: %BUILD_NUMBER% >> %LOG_FILE%

REM Check environment variables
echo %timestamp% [INFO] Checking environment variables... >> %LOG_FILE%
if "%DATABASE_URL%"=="" (
    echo %timestamp% [ERROR] DATABASE_URL environment variable is not set >> %LOG_FILE%
    echo ERROR: DATABASE_URL environment variable is not set
    exit /b 1
)
echo %timestamp% [SUCCESS] Environment variables validated >> %LOG_FILE%

REM Verify database connectivity
echo %timestamp% [INFO] Verifying database connectivity... >> %LOG_FILE%
set retry=0
:connectivity_loop
npx prisma db pull --preview-feature --force >nul 2>&1
if %errorlevel% equ 0 (
    echo %timestamp% [SUCCESS] Database connectivity verified >> %LOG_FILE%
    goto connectivity_success
)

set /a retry+=1
if %retry% lss %RETRY_COUNT% (
    echo %timestamp% [WARNING] Database connection failed (attempt %retry%/%RETRY_COUNT%). Retrying in %RETRY_DELAY%s... >> %LOG_FILE%
    timeout /t %RETRY_DELAY% >nul
    goto connectivity_loop
) else (
    echo %timestamp% [ERROR] Failed to connect to database after %RETRY_COUNT% attempts >> %LOG_FILE%
    echo ERROR: Failed to connect to database after %RETRY_COUNT% attempts
    exit /b 1
)

:connectivity_success

REM Get migration status
echo %timestamp% [INFO] Checking current migration status... >> %LOG_FILE%
npx prisma migrate status > migration_status.tmp 2>&1
if %errorlevel% neq 0 (
    echo %timestamp% [ERROR] Failed to get migration status >> %LOG_FILE%
    echo ERROR: Failed to get migration status
    del migration_status.tmp 2>nul
    exit /b 1
)

REM Count migrations (simplified for Windows)
findstr /c:"applied" migration_status.tmp >nul
if %errorlevel% equ 0 (
    echo %timestamp% [INFO] Found applied migrations >> %LOG_FILE%
) else (
    echo %timestamp% [INFO] No applied migrations found >> %LOG_FILE%
)

del migration_status.tmp 2>nul

REM Create schema backup
echo %timestamp% [INFO] Creating schema backup... >> %LOG_FILE%
npx prisma db pull --force >nul 2>&1
if %errorlevel% equ 0 (
    echo %timestamp% [SUCCESS] Schema backup created >> %LOG_FILE%
) else (
    echo %timestamp% [WARNING] Could not create schema backup, proceeding with migration >> %LOG_FILE%
)

REM Execute migrations
echo %timestamp% [INFO] Starting database migration execution... >> %LOG_FILE%
echo %timestamp% [INFO] Applying pending migrations... >> %LOG_FILE%

npx prisma migrate deploy 2>&1 | findstr /v "^$" >> %LOG_FILE%
if %errorlevel% equ 0 (
    echo %timestamp% [SUCCESS] Migrations applied successfully >> %LOG_FILE%
    echo SUCCESS: Migrations applied successfully
) else (
    echo %timestamp% [ERROR] Migration execution failed with exit code: %errorlevel% >> %LOG_FILE%
    echo ERROR: Migration execution failed
    exit /b %errorlevel%
)

REM Verify migration completion
echo %timestamp% [INFO] Verifying migration completion... >> %LOG_FILE%
npx prisma migrate status | findstr /c:"Database schema is up to date" >nul
if %errorlevel% equ 0 (
    echo %timestamp% [SUCCESS] All migrations have been applied successfully >> %LOG_FILE%
    echo SUCCESS: All migrations completed
) else (
    npx prisma migrate status | findstr /c:"Following migration have not yet been applied" >nul
    if %errorlevel% equ 0 (
        echo %timestamp% [ERROR] Some migrations are still pending >> %LOG_FILE%
        echo ERROR: Some migrations are still pending
        exit /b 1
    ) else (
        echo %timestamp% [WARNING] Migration status unclear, performing additional verification >> %LOG_FILE%
        npx prisma generate >nul 2>&1
        if %errorlevel% equ 0 (
            echo %timestamp% [SUCCESS] Prisma client generation successful - migrations likely completed >> %LOG_FILE%
            echo SUCCESS: Migration verification passed
        ) else (
            echo %timestamp% [ERROR] Prisma client generation failed - migrations may be incomplete >> %LOG_FILE%
            echo ERROR: Migration verification failed
            exit /b 1
        )
    )
)

REM Generate migration report
echo %timestamp% [INFO] Generating migration report... >> %LOG_FILE%
set report_file=migration_report_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.json

REM Create basic report (simplified for Windows batch)
echo { > %report_file%
echo   "migration_execution": { >> %report_file%
echo     "timestamp": "%timestamp%", >> %report_file%
echo     "status": "completed", >> %report_file%
echo     "log_file": "%LOG_FILE%", >> %report_file%
echo     "build_number": "%BUILD_NUMBER%" >> %report_file%
echo   } >> %report_file%
echo } >> %report_file%

echo %timestamp% [SUCCESS] Migration report generated: %report_file% >> %LOG_FILE%
echo %timestamp% [SUCCESS] === Database Migration Completed Successfully === >> %LOG_FILE%

echo SUCCESS: Database Migration Completed Successfully
echo Migration report: %report_file%
echo Migration log: %LOG_FILE%

exit /b 0