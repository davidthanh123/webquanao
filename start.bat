@echo off
echo ========================================
echo     FASHION STORE - KHOI DONG WEB
echo ========================================
echo.
echo Dang khoi dong Backend...
start "Backend" cmd /k "cd /d D:\DAVID2\webquanao\backend && node server.js"

timeout /t 2 /nobreak >nul

echo Dang khoi dong Frontend...
start "Frontend" cmd /k "cd /d D:\DAVID2\webquanao\frontend && npm start"

echo.
echo ========================================
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:3000
echo ========================================
echo.
echo Trinh duyet se tu mo sau vai giay...
pause