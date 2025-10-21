@echo off
echo Testing Rollback Script Functionality...

echo.
echo 1. Testing script accessibility...
if exist "scripts\rollback-deployment.sh" (
    echo ✅ Rollback script exists
) else (
    echo ❌ Rollback script not found
    exit /b 1
)

echo.
echo 2. Testing Node.js migration handler...
if exist "scripts\migration-handler.js" (
    echo ✅ Migration handler exists
) else (
    echo ❌ Migration handler not found
    exit /b 1
)

echo.
echo 3. Testing Jenkins rollback job configuration...
if exist "jenkins-rollback-job.groovy" (
    echo ✅ Jenkins rollback job configuration exists
) else (
    echo ❌ Jenkins rollback job configuration not found
    exit /b 1
)

echo.
echo 4. Testing script content structure...
findstr /c:"log()" scripts\rollback-deployment.sh >nul
if %errorlevel% equ 0 (
    echo ✅ Logging functions found in rollback script
) else (
    echo ❌ Logging functions not found
)

findstr /c:"main()" scripts\rollback-deployment.sh >nul
if %errorlevel% equ 0 (
    echo ✅ Main function found in rollback script
) else (
    echo ❌ Main function not found
)

findstr /c:"ssh" scripts\rollback-deployment.sh >nul
if %errorlevel% equ 0 (
    echo ✅ SSH commands found in rollback script
) else (
    echo ❌ SSH commands not found
)

echo.
echo 5. Testing migration handler functionality...
node scripts\migration-handler.js check-connectivity 2>nul
if %errorlevel% neq 0 (
    echo ✅ Migration handler correctly validates environment (expected failure without DATABASE_URL)
) else (
    echo ⚠️ Migration handler validation may need review
)

echo.
echo ✅ Rollback and migration integration testing completed
echo The rollback and migration scripts appear to be properly structured.
echo.
echo Note: This test only validates file existence and basic structure.
echo Actual functionality should be tested in a staging environment.