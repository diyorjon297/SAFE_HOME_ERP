@echo off
title SAFE HOME ERP
color 0B

echo ========================================
echo        SAFE HOME SERVICES ERP
echo ========================================
echo.

echo Backend ishga tushmoqda...
start "SAFE HOME ERP - Backend" cmd /k "cd /d C:\Users\diyorjon\Desktop\SAFE_HOME_ERP\backend && call venv\Scripts\activate && python -m uvicorn main:app --host 127.0.0.1 --port 8001"

timeout /t 5 /nobreak >nul

echo Frontend ishga tushmoqda...
start "SAFE HOME ERP - Frontend" cmd /k "cd /d C:\Users\diyorjon\Desktop\SAFE_HOME_ERP\frontend && npm run dev -- --host 127.0.0.1"

timeout /t 7 /nobreak >nul

echo ERP ochilmoqda...
start http://localhost:5173

exit