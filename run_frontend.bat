@echo off
echo Starting Smart CPU Scheduler Frontend (Next.js)...
cd /d "%~dp0frontend"
node node_modules\next\dist\bin\next dev -H 127.0.0.1 -p 3000
pause
