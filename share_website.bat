@echo off
cd /d "c:\Users\ASUS\OneDrive\Desktop\New folder (7)"
start "SuperCareDiabetes Local Server" cmd /k ""C:\Python314\python.exe" -m http.server 8000 --bind 127.0.0.1"
timeout /t 3 /nobreak >nul
start "SuperCareDiabetes Public Link" cmd /k ""C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://127.0.0.1:8000"
