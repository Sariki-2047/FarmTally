@echo off
echo 🔧 PostgreSQL Password Fix for FarmTally
echo =========================================

echo.
echo This script will help you fix PostgreSQL password issues.
echo.

REM Add PostgreSQL to PATH
set PATH=%PATH%;C:\Program Files\PostgreSQL\18\bin;C:\Program Files\PostgreSQL\17\bin;C:\Program Files\PostgreSQL\16\bin

echo 🔍 Checking PostgreSQL installation...
psql --version
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL not found in PATH
    exit /b 1
)

echo.
echo 🔧 PostgreSQL Password Solutions:
echo.
echo 1. Try common default passwords
echo 2. Reset password using Windows authentication
echo 3. Create new superuser
echo 4. Manual password reset guide
echo.

set /p choice="Choose option (1-4): "

if "%choice%"=="1" goto try_defaults
if "%choice%"=="2" goto reset_password
if "%choice%"=="3" goto create_user
if "%choice%"=="4" goto manual_guide

:try_defaults
echo.
echo 🔍 Trying common default passwords...

set passwords=postgres password admin root 123456 farmtally Vision@2047

for %%p in (%passwords%) do (
    echo Testing password: %%p
    set PGPASSWORD=%%p
    psql -U postgres -h localhost -c "SELECT 'SUCCESS: Password %%p works!'" 2>nul
    if !errorlevel! equ 0 (
        echo ✅ SUCCESS! Password is: %%p
        echo.
        echo 📝 Update your .env file with:
        echo DATABASE_URL="postgresql://postgres:%%p@localhost:5432/farmtally"
        pause
        exit /b 0
    )
)

echo ❌ None of the common passwords worked.
echo 💡 Try option 2 to reset the password.
pause
exit /b 1

:reset_password
echo.
echo 🔧 Resetting PostgreSQL password...
echo.
echo This will attempt to reset the postgres user password.
echo.

REM Stop PostgreSQL service
echo Stopping PostgreSQL service...
net stop postgresql-x64-18 2>nul
net stop postgresql-x64-17 2>nul
net stop postgresql-x64-16 2>nul

echo.
echo 📝 Manual password reset steps:
echo.
echo 1. Open Services (services.msc)
echo 2. Find "postgresql-x64-XX" service
echo 3. Stop the service
echo 4. Open Command Prompt as Administrator
echo 5. Navigate to PostgreSQL bin directory
echo 6. Run: pg_ctl -D "C:\Program Files\PostgreSQL\18\data" -l logfile start --auth-local=trust
echo 7. Connect: psql -U postgres
echo 8. Change password: ALTER USER postgres PASSWORD 'new_password';
echo 9. Restart service normally
echo.

pause
goto end

:create_user
echo.
echo 👤 Creating new PostgreSQL user...
echo.
set /p newuser="Enter new username (default: farmtally_user): "
if "%newuser%"=="" set newuser=farmtally_user

set /p newpass="Enter new password (default: farmtally123): "
if "%newpass%"=="" set newpass=farmtally123

echo.
echo 📝 To create new user, you need to connect as an existing superuser.
echo If you can connect with any account, run these commands:
echo.
echo CREATE USER %newuser% WITH PASSWORD '%newpass%';
echo ALTER USER %newuser% CREATEDB;
echo CREATE DATABASE farmtally OWNER %newuser%;
echo.
echo Then update your .env file with:
echo DATABASE_URL="postgresql://%newuser%:%newpass%@localhost:5432/farmtally"
echo.

pause
goto end

:manual_guide
echo.
echo 📖 Manual PostgreSQL Password Reset Guide
echo ==========================================
echo.
echo Method 1: Using pgAdmin
echo -----------------------
echo 1. Open pgAdmin 4 (if installed)
echo 2. Connect to PostgreSQL server
echo 3. Right-click on postgres user
echo 4. Select "Properties" → "Definition"
echo 5. Change password and save
echo.
echo Method 2: Using Windows Authentication
echo -------------------------------------
echo 1. Open Command Prompt as Administrator
echo 2. Navigate to: C:\Program Files\PostgreSQL\18\bin
echo 3. Stop service: net stop postgresql-x64-18
echo 4. Start with trust: pg_ctl -D "C:\Program Files\PostgreSQL\18\data" start -o "-p 5432" -o "--auth-local=trust"
echo 5. Connect: psql -U postgres
echo 6. Change password: ALTER USER postgres PASSWORD 'new_password';
echo 7. Exit: \q
echo 8. Stop: pg_ctl -D "C:\Program Files\PostgreSQL\18\data" stop
echo 9. Start service: net start postgresql-x64-18
echo.
echo Method 3: Reinstall PostgreSQL
echo ------------------------------
echo 1. Uninstall PostgreSQL from Control Panel
echo 2. Delete data directory: C:\Program Files\PostgreSQL
echo 3. Download fresh installer from postgresql.org
echo 4. Install and set a password you'll remember
echo.

pause

:end
echo.
echo 💡 After fixing the password, run: setup-database-fixed.bat
echo.
pause