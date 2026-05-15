@echo off
setlocal

cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-preview.ps1"

if errorlevel 1 (
  echo.
  echo Local preview failed. Check the messages above.
  pause
)
