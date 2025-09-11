@echo off
echo ============================================
echo   IDX Data Validation - Deploy to Fly.io
echo ============================================
echo.

cd /d "%~dp0"

echo Checking if we're in backend directory...
if not exist "requirements.txt" (
    echo ERROR: requirements.txt not found. Make sure you're running this from the backend directory.
    pause
    exit /b 1
)

echo.
echo 1. Building and deploying to Fly.io...
flyctl deploy

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
echo Your backend is now available at:
flyctl info | findstr "Hostname"

echo.
echo Next steps:
echo 1. Copy the backend URL above
echo 2. Set REACT_APP_API_URL in Vercel to: https://your-backend-url.fly.dev/api
echo 3. Deploy frontend with: vercel --prod
echo.
pause
