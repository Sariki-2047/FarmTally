
@echo off
echo 🚀 Area 1 Direct Deployment - Windows
echo.

echo 1️⃣ Copying server file to container...
docker cp server-area1-direct.js farmtally-backend-isolated:/app/
if %errorlevel% neq 0 (
    echo ❌ Failed to copy server file
    pause
    exit /b 1
)

echo 2️⃣ Copying package.json to container...
docker cp container-package.json farmtally-backend-isolated:/app/package.json
if %errorlevel% neq 0 (
    echo ❌ Failed to copy package.json
    pause
    exit /b 1
)

echo 3️⃣ Installing dependencies...
docker exec farmtally-backend-isolated npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo 4️⃣ Restarting backend container...
docker restart farmtally-backend-isolated
if %errorlevel% neq 0 (
    echo ❌ Failed to restart container
    pause
    exit /b 1
)

echo 5️⃣ Waiting for container to start...
timeout /t 10 /nobreak > nul

echo 6️⃣ Checking container logs...
docker logs farmtally-backend-isolated --tail=10

echo.
echo 🎉 Area 1 Direct Deployment Complete!
echo.
echo 🧪 Testing endpoints...
curl http://147.93.153.247:8082/api
echo.
curl http://147.93.153.247:8082/api/health/db
echo.
curl http://147.93.153.247:8082/api/users
echo.

echo ✅ Area 1 deployment finished!
pause
