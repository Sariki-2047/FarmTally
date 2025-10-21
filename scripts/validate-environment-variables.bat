@echo off
setlocal enabledelayedexpansion

REM Environment Variable Validation Script for FarmTally (Windows)
REM This script validates that all required environment variables are properly set

echo 🔍 Validating environment variables for FarmTally deployment...

set VALIDATION_ERRORS=0
set VALIDATION_WARNINGS=0

REM Function to check required variables
:check_required_var
set var_name=%1
set description=%2
call set var_value=%%%var_name%%%

if "!var_value!"=="" (
    echo ❌ REQUIRED: %var_name% is not set or empty
    echo    Description: %description%
    set /a VALIDATION_ERRORS+=1
    goto :eof
) else (
    call :strlen !var_value! length
    echo ✅ %var_name% ^(!length! characters^)
)
goto :eof

REM Function to check optional variables
:check_optional_var
set var_name=%1
set description=%2
call set var_value=%%%var_name%%%

if "!var_value!"=="" (
    echo ⚠️  OPTIONAL: %var_name% is not set
    echo    Description: %description%
    set /a VALIDATION_WARNINGS+=1
    goto :eof
) else (
    call :strlen !var_value! length
    echo ✅ %var_name% ^(!length! characters^)
)
goto :eof

REM Function to get string length
:strlen
set str=%1
set length=0
:strlen_loop
if "!str!"=="" goto :strlen_end
set str=!str:~1!
set /a length+=1
goto :strlen_loop
:strlen_end
set %2=%length%
goto :eof

REM Function to validate URL format
:validate_url
set var_name=%1
call set var_value=%%%var_name%%%

echo !var_value! | findstr /r "^https\?://[a-zA-Z0-9.-]" >nul
if !errorlevel! equ 0 (
    echo    ✓ Valid URL format
) else (
    echo    ✗ Invalid URL format
    set /a VALIDATION_ERRORS+=1
)
goto :eof

REM Function to validate numeric values
:validate_numeric
set var_name=%1
set var_value=%2
set min_val=%3
set max_val=%4

echo %var_value% | findstr /r "^[0-9][0-9]*$" >nul
if !errorlevel! equ 0 (
    if defined min_val (
        if %var_value% lss %min_val% (
            echo    ✗ %var_name% value too low ^(%var_value%, minimum %min_val%^)
            set /a VALIDATION_ERRORS+=1
            goto :eof
        )
    )
    if defined max_val (
        if %var_value% gtr %max_val% (
            echo    ✗ %var_name% value too high ^(%var_value%, maximum %max_val%^)
            set /a VALIDATION_ERRORS+=1
            goto :eof
        )
    )
    echo    ✓ Valid numeric value ^(%var_value%^)
) else (
    echo    ✗ %var_name% is not a valid number ^(%var_value%^)
    set /a VALIDATION_ERRORS+=1
)
goto :eof

echo.
echo 🔍 Checking required backend environment variables:

REM Database configuration
call :check_required_var DATABASE_URL "PostgreSQL database connection URL"

REM JWT configuration
call :check_required_var JWT_SECRET "JWT signing secret for authentication"
call :check_required_var JWT_EXPIRES_IN "JWT token expiration time"
call :check_required_var JWT_REFRESH_EXPIRES_IN "JWT refresh token expiration time"

REM CORS configuration
call :check_required_var CORS_ORIGINS "Allowed CORS origins for API access"

REM SMTP configuration
call :check_required_var SMTP_HOST "SMTP server hostname"
call :check_required_var SMTP_USER "SMTP authentication username"
call :check_required_var SMTP_PASS "SMTP authentication password"
call :check_required_var SMTP_PORT "SMTP server port"

REM Application configuration
call :check_required_var PORT "Application server port"
if defined PORT call :validate_numeric PORT %PORT% 1000 65535

call :check_required_var NODE_ENV "Node.js environment"
call :check_required_var FRONTEND_URL "Frontend URL for email links"
if defined FRONTEND_URL call :validate_url FRONTEND_URL

echo.
echo 🔍 Checking security and performance settings:

call :check_required_var BCRYPT_SALT_ROUNDS "BCrypt salt rounds for password hashing"
if defined BCRYPT_SALT_ROUNDS call :validate_numeric BCRYPT_SALT_ROUNDS %BCRYPT_SALT_ROUNDS% 10 15

call :check_required_var MAX_FILE_SIZE "Maximum file upload size in bytes"
if defined MAX_FILE_SIZE call :validate_numeric MAX_FILE_SIZE %MAX_FILE_SIZE% 1048576 52428800

call :check_required_var RATE_LIMIT_WINDOW_MS "Rate limiting window in milliseconds"
if defined RATE_LIMIT_WINDOW_MS call :validate_numeric RATE_LIMIT_WINDOW_MS %RATE_LIMIT_WINDOW_MS% 60000 3600000

call :check_required_var RATE_LIMIT_MAX "Maximum requests per rate limit window"
if defined RATE_LIMIT_MAX call :validate_numeric RATE_LIMIT_MAX %RATE_LIMIT_MAX% 10 1000

echo.
echo 🔍 Checking frontend environment variables:

call :check_required_var NEXT_PUBLIC_API_URL "Frontend API endpoint URL"
if defined NEXT_PUBLIC_API_URL call :validate_url NEXT_PUBLIC_API_URL

call :check_required_var NEXT_PUBLIC_SUPABASE_URL "Supabase project URL"
if defined NEXT_PUBLIC_SUPABASE_URL call :validate_url NEXT_PUBLIC_SUPABASE_URL

call :check_required_var NEXT_PUBLIC_SUPABASE_ANON_KEY "Supabase anonymous access key"

echo.
echo 🔍 Checking optional configuration:

call :check_optional_var REDIS_URL "Redis connection URL for caching"
call :check_optional_var EMAIL_NOTIFICATIONS_ENABLED "Enable/disable email notifications"
call :check_optional_var SMTP_FROM_NAME "Email sender display name"

REM Generate validation report
echo.
echo 📊 Validation Summary:
echo    Errors: %VALIDATION_ERRORS%
echo    Warnings: %VALIDATION_WARNINGS%

REM Create validation report file
set timestamp=%date:~-4%-%date:~4,2%-%date:~7,2%T%time:~0,2%:%time:~3,2%:%time:~6,2%Z
if not defined BUILD_NUMBER set BUILD_NUMBER=unknown
if not defined GIT_COMMIT set GIT_COMMIT=unknown

(
echo {
echo     "timestamp": "%timestamp%",
echo     "buildNumber": "%BUILD_NUMBER%",
echo     "gitCommit": "%GIT_COMMIT%",
echo     "validation": {
echo         "errors": %VALIDATION_ERRORS%,
echo         "warnings": %VALIDATION_WARNINGS%,
if %VALIDATION_ERRORS% equ 0 (
echo         "status": "passed"
) else (
echo         "status": "failed"
)
echo     }
echo }
) > environment-validation-report.json

echo 📝 Validation report saved to environment-validation-report.json

REM Exit with error if validation failed
if %VALIDATION_ERRORS% gtr 0 (
    echo.
    echo ❌ Environment validation failed with %VALIDATION_ERRORS% error^(s^)!
    echo    Please fix the above issues before proceeding with deployment.
    exit /b 1
) else (
    echo.
    echo ✅ Environment validation passed successfully!
    if %VALIDATION_WARNINGS% gtr 0 (
        echo    Note: %VALIDATION_WARNINGS% warning^(s^) found - review recommended.
    )
    exit /b 0
)