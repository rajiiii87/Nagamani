#!/bin/bash

# GST Invoice System Setup Script

echo "=========================================="
echo "GST Invoice Management System Setup"
echo "=========================================="
echo ""

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Backend Setup
echo "Setting up Backend..."
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    echo "✓ Backend dependencies installed"
else
    echo "✓ Backend dependencies already installed"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠ Please update .env file with your MongoDB URI"
else
    echo "✓ .env file already exists"
fi

cd ..

# Frontend Setup
echo ""
echo "Setting up Frontend..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    echo "✓ Frontend dependencies installed"
else
    echo "✓ Frontend dependencies already installed"
fi

cd ..

echo ""
echo "=========================================="
echo "✓ Setup Complete!"
echo "=========================================="
echo ""
echo "To start the application:"
echo ""
echo "1. Start MongoDB (if local):"
echo "   mongod"
echo ""
echo "2. In one terminal, start Backend:"
echo "   cd backend && npm run dev"
echo ""
echo "3. In another terminal, start Frontend:"
echo "   cd frontend && npm start"
echo ""
echo "Frontend will open at: http://localhost:3000"
echo "Backend API at: http://localhost:5000"
echo ""
echo "First Steps:"
echo "1. Configure Company Profile"
echo "2. Add Parties/Customers"
echo "3. Configure Goods & Items"
echo "4. Create Invoices"
echo ""
