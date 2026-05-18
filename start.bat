@echo off
echo ================================
echo    Starting EcoSense AI App
echo ================================
echo.

echo Starting Backend Server...
start cmd /k "cd /d d:\hackthone\backend && python app.py"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start cmd /k "cd /d d:\hackthone\frontend && npm run dev"

timeout /t 5 /nobreak > nul

echo Opening Browser...
start chrome "http://localhost:5173"

echo.
echo ================================
echo  EcoSense AI is running!
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:5173
echo ================================
