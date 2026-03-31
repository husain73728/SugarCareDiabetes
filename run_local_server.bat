@echo off
setlocal

cd /d "%~dp0"

start "" powershell -NoProfile -Command "Start-Sleep -Seconds 1; Start-Process 'http://127.0.0.1:8000/'"

where py >nul 2>nul
if %errorlevel%==0 (
	py -3 -m http.server 8000 --bind 127.0.0.1
	goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
	python -m http.server 8000 --bind 127.0.0.1
	goto :eof
)

echo Python was not found in PATH.
echo Install Python or add it to PATH, then run this file again.
pause
