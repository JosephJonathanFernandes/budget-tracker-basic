@echo off
echo ========================================
echo NPM Error Fixer - Budget Tracker Pro
echo ========================================
echo.

echo [1/5] Cleaning npm cache...
call npm cache clean --force

echo.
echo [2/5] Removing node_modules...
if exist node_modules rmdir /s /q node_modules

echo.
echo [3/5] Removing package-lock.json...
if exist package-lock.json del package-lock.json

echo.
echo [4/5] Reinstalling dependencies...
call npm install

echo.
echo [5/5] Done! Try running your project now.
echo.
echo Commands you can use:
echo   npm start      - Start the server
echo   npm run dev    - Start with auto-reload
echo   node server.js - Start directly
echo.
pause
