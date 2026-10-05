@echo off
cd /d "C:\Users\user\Desktop\SAFE_HOME_ERP"

start "" /b cmd /c "cd /d C:\Users\user\Desktop\SAFE_HOME_ERP\backend_NEW\backend && C:\Users\user\Desktop\SAFE_HOME_ERP\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8001"

timeout /t 5 /nobreak >nul

start "" /b cmd /c "cd /d C:\Users\user\Desktop\SAFE_HOME_ERP\frontend && npm run dev -- --host 127.0.0.1"

timeout /t 7 /nobreak >nul

start "" "http://127.0.0.1:5173"