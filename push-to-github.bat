@echo off
echo Pushing FarmTally to GitHub...

REM Replace YOUR_USERNAME with your actual GitHub username
set /p username="Enter your GitHub username: "

git remote add origin https://github.com/%username%/FarmTally.git
git branch -M main
git push -u origin main

echo.
echo ✅ Code pushed to GitHub successfully!
echo.
echo Next steps:
echo 1. Go to https://vercel.com
echo 2. Click "New Project"
echo 3. Import from GitHub: %username%/FarmTally
echo 4. Set root directory to: farmtally-frontend
echo 5. Add environment variables
echo.
pause