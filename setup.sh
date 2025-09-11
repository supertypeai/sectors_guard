#!/bin/bash

# IDX Data Validation Dashboard Setup Script
# This script sets up the entire project for development

echo "🚀 Setting up IDX Data Validation Dashboard..."

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.11+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Backend
echo "📦 Setting up Python backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate  # For Linux/Mac
# venv\Scripts\activate  # For Windows (uncomment this line and comment above for Windows)

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Backend setup completed"

# Setup Frontend
echo "📦 Setting up React frontend..."
cd ../frontend

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

echo "✅ Frontend setup completed"

# Go back to root
cd ..

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual configuration values!"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your Supabase and email configuration"
echo "2. Set up database tables using the SQL commands in docs/README.md"
echo "3. Configure GitHub secrets for automated workflows"
echo ""
echo "🚀 To start development:"
echo "Backend:  cd backend && python main.py"
echo "Frontend: cd frontend && npm start"
echo ""
echo "📚 View documentation: docs/README.md"
echo "🌐 Dashboard will be available at: http://localhost:3000"
echo "🔧 API documentation: http://localhost:8000/docs"
