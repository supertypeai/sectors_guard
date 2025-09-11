@echo off
REM IDX Data Validation Dashboard Setup Script for Windows
REM This script sets up the entire project for development

echo 🚀 Setting up IDX Data Validation Dashboard...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.11+ first.
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Setup Backend
echo 📦 Setting up Python backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install Python dependencies
echo Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

echo ✅ Backend setup completed

REM Setup Frontend
echo 📦 Setting up React frontend...
cd ..\frontend

REM Install Node.js dependencies
echo Installing Node.js dependencies...
npm install

echo ✅ Frontend setup completed

REM Go back to root
cd ..

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your actual configuration values!
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Edit .env file with your Supabase and email configuration
echo 2. Set up database tables using the SQL commands in docs/README.md
echo 3. Configure GitHub secrets for automated workflows
echo.
echo 🚀 To start development:
echo Backend:  cd backend ^&^& python main.py
echo Frontend: cd frontend ^&^& npm start
echo.
echo 📚 View documentation: docs/README.md
echo 🌐 Dashboard will be available at: http://localhost:3000
echo 🔧 API documentation: http://localhost:8000/docs

pause
