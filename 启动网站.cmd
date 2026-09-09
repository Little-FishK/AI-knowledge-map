@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\start-local-site.ps1"
if errorlevel 1 (
  echo.
  echo Failed to start the local website. Please keep this window open and report the message above.
  pause
)
endlocal
