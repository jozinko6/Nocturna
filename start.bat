@echo off
title Nocturna — Dark Fantasy RPG
echo.
echo  ╔══════════════════════════════════╗
echo  ║       N O C T U R N A           ║
echo  ║   Dark Fantasy Browser RPG      ║
echo  ╚══════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/2] Checking dependencies...
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

echo [2/2] Starting dev server...
echo.
echo  ➜  Local:   http://localhost:3000
echo  ➜  Network: http://localhost:3000
echo.
echo  Press Ctrl+C to stop.
echo.

npx next dev --port 3000

pause
