@echo off
echo ========================================================
echo   Smart CPU Scheduler: Simulation and Optimization
echo ========================================================
echo.
echo [1/3] Launching Backend on http://127.0.0.1:8000 ...
start "Smart CPU Scheduler - Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

echo [2/3] Launching Frontend on http://127.0.0.1:3000 ...
start "Smart CPU Scheduler - Frontend" cmd /k "cd /d %~dp0frontend && node node_modules\next\dist\bin\next dev -H 127.0.0.1 -p 3000"

echo [3/3] Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo Opening browser at http://127.0.0.1:3000 ...
start http://127.0.0.1:3000

echo.
echo ========================================================
echo   All servers are running!
echo   - App:     http://127.0.0.1:3000
echo   - API Doc: http://127.0.0.1:8000/docs
echo ========================================================
echo (You can minimize this window. Do not close it while using.)
pause
