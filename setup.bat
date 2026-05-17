@echo off
REM GST Invoice System Setup Script for Windows

echo ==========================================
echo GST Invoice Management System Setup
echo ==========================================
echo.

REM Check Node.js installation
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Node.js version: %NODE_VERSION%
echo.

REM Backend Setup
echo Setting up Backend...
cd backend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    echo Backend dependencies installed
) else (
    echo Backend dependencies already installed
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo Please update .env file with your MongoDB URI
) else (
    echo .env file already exists
)

cd ..

REM Frontend Setup
echo.
echo Setting up Frontend...
cd frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    echo Frontend dependencies installed
) else (
    echo Frontend dependencies already installed
)

cd ..

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo To start the application:
echo.
echo 1. Start MongoDB (if local):
echo    mongod
echo.
echo 2. In Command Prompt 1, start Backend:
echo    cd backend && npm run dev
echo.
echo 3. In Command Prompt 2, start Frontend:
echo    cd frontend && npm start
echo.
echo Frontend will open at: http://localhost:3000
echo Backend API at: http://localhost:5000
echo.
echo First Steps:
echo 1. Configure Company Profile
echo 2. Add Parties/Customers
echo 3. Configure Goods and Items
echo 4. Create Invoices
echo.
pause
