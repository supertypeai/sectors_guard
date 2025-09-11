@echo off
echo ============================================
echo   IDX Data Validation - Deploy to Vercel
echo ============================================
echo.

cd /d "%~dp0"

echo Checking if we're in frontend directory...
if not exist "package.json" (
    echo ERROR: package.json not found. Make sure you're running this from the frontend directory.
    pause
    exit /b 1
)

echo.
echo Please make sure you have set REACT_APP_API_URL environment variable in Vercel dashboard
echo Example: REACT_APP_API_URL = https://your-backend.fly.dev/api
echo.
set /p continue="Have you set the API URL in Vercel? (y/n): "

if /i not "%continue%"=="y" (
    echo.
    echo Please set the environment variable first:
    echo 1. Go to https://vercel.com/dashboard
    echo 2. Select your project
    echo 3. Go to Settings ^> Environment Variables
    echo 4. Add: REACT_APP_API_URL = https://your-backend.fly.dev/api
    pause
    exit /b 1
)

echo.
echo 1. Deploying to Vercel...
vercel --prod

if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Deployment failed!
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Deployment completed successfully!
echo ============================================
echo.
echo Your frontend is now live!
echo Check the URL provided by Vercel above.
echo.
pause
